//+------------------------------------------------------------------+
//| KiarosSMC.mq5                                                  |
//| Taught SMC on XAUUSD — live publish, no AI gate.                  |
//|                                                                    |
//| Doctrine (same as signals/strategies/ict_smc/detector.py):      |
//|   H1 liquidity sweep of a confirmed swing, then CHoCH           |
//|   ADX14 >= 18; skip when H4 EMA9/21 opposes the setup               |
//|   Stop beyond the sweep wick + 0.5 ATR; TP 1R/2R/3R             |
//|                                                                    |
//| Keep KiarosTickPush.mq5 attached for ticks/candles + outcomes.  |
//| Allow WebRequest for SignalApiUrl + ChartApiUrl origin:            |
//| Tools → Options → Expert Advisors                                  |
//+------------------------------------------------------------------+
#property strict
#property copyright "Kiaros"
#property version   "1.00"

input string AppSymbol       = "XAUUSD";
input string SignalApiUrl    = "https://qauntify-web.vercel.app/api/mt5/signal";
input string ChartApiUrl     = "https://qauntify-web.vercel.app/api/mt5/chart";
input string WebhookSecret   = "906f61d7dbd1aa2c72cc19a7a0382ce61434f8bd5d6d6c65466912d9808097e4";
input bool   UploadChartShot = true;
input int    ChartWidth      = 1280;
input int    ChartHeight     = 720;
input bool   ShowSignalPins  = true;
input int    HistoryPinBars  = 300;
input int    Confidence      = 75;
input int    MinBars         = 60;
input int    PivotLeft       = 2;
input int    PivotRight      = 2;
input int    StructureLookback = 60;
input int    SweepLookback   = 12;
input int    ChochLookback   = 5;
input int    MaxBarsSinceChoch = 4;
input double StopAtrBuffer   = 0.5;
input double MaxStopAtr      = 2.0;
input double MinSweepAtrFrac = 0.15;
input double AdxTrendMin     = 18.0;

datetime lastEvaluatedBar = 0;
bool     historyDone = false;
long     signalsOk = 0;
long     signalsFail = 0;
long     signalsSkip = 0;
int      lastHttp = 0;
string   lastStatus = "idle";

int hAtr1 = INVALID_HANDLE;
int hAdx1 = INVALID_HANDLE;
int hEma9_4 = INVALID_HANDLE;
int hEma21_4 = INVALID_HANDLE;

struct SmcSetup
  {
   string   direction;
   string   structure;
   double   entry;
   double   stop;
   double   tp1;
   double   tp2;
   double   tp3;
   double   sweep_level;
   double   choch_level;
   double   sweep_ext;
   double   atr;
   double   adx;
   datetime sweep_time;
   datetime choch_time;
   int      bias;
  };

void PinsClear()
  {
   int total = ObjectsTotal(0, 0, -1);
   for(int i = total - 1; i >= 0; i--)
     {
      string name = ObjectName(0, i, 0, -1);
      if(StringFind(name, "QS_") == 0)
         ObjectDelete(0, name);
     }
  }

void LevelLine(const string name, const datetime t0, const datetime t1,
               const double price, const color clr, const int style, const int width)
  {
   ObjectDelete(0, name);
   if(!ObjectCreate(0, name, OBJ_TREND, 0, t0, price, t1, price)) return;
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_STYLE, style);
   ObjectSetInteger(0, name, OBJPROP_WIDTH, width);
   ObjectSetInteger(0, name, OBJPROP_RAY_RIGHT, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_BACK, false);
  }

void PinSignal(const SmcSetup &setup, const int confirmShift, const bool withLevels)
  {
   if(!ShowSignalPins) return;
   if(confirmShift < 1) return;

   datetime t = iTime(_Symbol, PERIOD_H1, confirmShift);
   if(t == 0) return;
   double low = iLow(_Symbol, PERIOD_H1, confirmShift);
   double high = iHigh(_Symbol, PERIOD_H1, confirmShift);
   bool isBuy = (setup.direction == "long");
   color markClr = isBuy ? clrLime : clrRed;
   datetime tEnd = t + (datetime)(PeriodSeconds(PERIOD_H1) * 8);
   string id = "QS_" + IntegerToString((long)t) + (isBuy ? "_B" : "_S");

   string arrow = id + "_arr";
   ObjectDelete(0, arrow);
   ENUM_OBJECT arrowType = isBuy ? OBJ_ARROW_BUY : OBJ_ARROW_SELL;
   double arrowPrice = isBuy ? low : high;
   if(ObjectCreate(0, arrow, arrowType, 0, t, arrowPrice))
     {
      ObjectSetInteger(0, arrow, OBJPROP_COLOR, markClr);
      ObjectSetInteger(0, arrow, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, arrow, OBJPROP_SELECTABLE, false);
     }

   string tag = id + "_tag";
   ObjectDelete(0, tag);
   double tagPrice = isBuy ? (low - (high - low) * 0.15 - 0.5)
                           : (high + (high - low) * 0.15 + 0.5);
   if(ObjectCreate(0, tag, OBJ_TEXT, 0, t, tagPrice))
     {
      ObjectSetString(0, tag, OBJPROP_TEXT, isBuy ? "BUY SMC" : "SELL SMC");
      ObjectSetInteger(0, tag, OBJPROP_COLOR, markClr);
      ObjectSetInteger(0, tag, OBJPROP_FONTSIZE, 9);
      ObjectSetString(0, tag, OBJPROP_FONT, "Arial Bold");
      ObjectSetInteger(0, tag, OBJPROP_ANCHOR,
                       isBuy ? ANCHOR_UPPER : ANCHOR_LOWER);
      ObjectSetInteger(0, tag, OBJPROP_SELECTABLE, false);
     }

   if(withLevels)
     {
      datetime sweepT = setup.sweep_time > 0 ? setup.sweep_time : t;
      datetime chochT = setup.choch_time > 0 ? setup.choch_time : t;
      LevelLine(id + "_sw", sweepT, tEnd, setup.sweep_level, clrGold, STYLE_DOT, 1);
      LevelLine(id + "_ch", chochT, tEnd, setup.choch_level, clrDodgerBlue, STYLE_DASH, 1);
      LevelLine(id + "_en", t, tEnd, setup.entry, clrDodgerBlue, STYLE_SOLID, 2);
      LevelLine(id + "_sl", t, tEnd, setup.stop, clrOrangeRed, STYLE_DASH, 1);
      LevelLine(id + "_tp", t, tEnd, setup.tp1, clrMediumSeaGreen, STYLE_DASH, 1);
     }

   ChartRedraw(0);
  }

string AuthHeaders()
  {
   return "Content-Type: application/json\r\n"
          "Authorization: Bearer " + WebhookSecret + "\r\n";
  }

int HttpPost(const string url, const string body, string &responseBody)
  {
   char post[];
   char result[];
   string resultHeaders;
   StringToCharArray(body, post, 0, StringLen(body));
   int status = WebRequest("POST", url, AuthHeaders(), 30000, post, result, resultHeaders);
   responseBody = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
   return status;
  }

string ExtractJsonString(const string json, const string key)
  {
   string needle = "\"" + key + "\":\"";
   int p = StringFind(json, needle);
   if(p < 0) return "";
   p += StringLen(needle);
   int end = StringFind(json, "\"", p);
   if(end < 0) return "";
   return StringSubstr(json, p, end - p);
  }

bool UploadSetupChart(const string signalId)
  {
   if(!UploadChartShot) return true;
   if(StringLen(ChartApiUrl) < 8) return false;
   if(StringLen(signalId) < 8) return false;

   ChartRedraw(0);
   Sleep(250);

   string fileName = "qs_chart_" + signalId + ".png";
   int w = ChartWidth > 640 ? ChartWidth : 1280;
   int h = ChartHeight > 360 ? ChartHeight : 720;
   if(!ChartScreenShot(0, fileName, w, h, ALIGN_RIGHT))
     {
      Print("KiarosSMC: ChartScreenShot failed ", GetLastError());
      return false;
     }

   int handle = FileOpen(fileName, FILE_READ|FILE_BIN);
   if(handle == INVALID_HANDLE)
     {
      Print("KiarosSMC: open screenshot failed ", GetLastError());
      return false;
     }
   int size = (int)FileSize(handle);
   if(size <= 0)
     {
      FileClose(handle);
      FileDelete(fileName);
      return false;
     }
   uchar data[];
   ArrayResize(data, size);
   if(FileReadArray(handle, data, 0, size) != size)
     {
      FileClose(handle);
      FileDelete(fileName);
      Print("KiarosSMC: read screenshot failed ", GetLastError());
      return false;
     }
   FileClose(handle);
   FileDelete(fileName);

   uchar key[];
   uchar encoded[];
   if(!CryptEncode(CRYPT_BASE64, data, key, encoded))
     {
      Print("KiarosSMC: base64 encode failed ", GetLastError());
      return false;
     }
   string b64 = CharArrayToString(encoded, 0, WHOLE_ARRAY, CP_UTF8);

   string body = "{\"signal_id\":\"" + signalId +
                 "\",\"kind\":\"setup\",\"image_base64\":\"" + b64 + "\"}";
   string resp = "";
   int status = HttpPost(ChartApiUrl, body, resp);
   if(status == 200)
     {
      Print("KiarosSMC: chart uploaded for ", signalId);
      return true;
     }
   Print("KiarosSMC: chart upload HTTP ", status, " ", resp);
   return false;
  }

bool Copy1(const int handle, const int buffer, const int shift, double &out)
  {
   double buf[];
   if(CopyBuffer(handle, buffer, shift, 1, buf) != 1) return false;
   out = buf[0];
   return true;
  }

bool RiskOk(const double entry, const double stop, const double atr)
  {
   if(atr <= 0.0) return false;
   return MathAbs(entry - stop) / atr <= MaxStopAtr;
  }

void FillRTargets(const double entry, const double stop, const bool isLong,
                  double &tp1, double &tp2, double &tp3)
  {
   double risk = MathAbs(entry - stop);
   if(isLong)
     {
      tp1 = entry + 1.0 * risk;
      tp2 = entry + 2.0 * risk;
      tp3 = entry + 3.0 * risk;
     }
   else
     {
      tp1 = entry - 1.0 * risk;
      tp2 = entry - 2.0 * risk;
      tp3 = entry - 3.0 * risk;
     }
  }

int HtfBiasAt(const int confirmShift)
  {
   datetime t = iTime(_Symbol, PERIOD_H1, confirmShift);
   if(t <= 0) return 0;
   datetime h1Close = t + (datetime)PeriodSeconds(PERIOD_H1);
   int h4 = iBarShift(_Symbol, PERIOD_H4, h1Close - 1, true);
   if(h4 < 0) return 0;
   datetime h4Open = iTime(_Symbol, PERIOD_H4, h4);
   if(h4Open > 0 && h4Open + (datetime)PeriodSeconds(PERIOD_H4) > h1Close)
      h4 += 1;
   if(h4 < 0) return 0;

   double ema9, ema21;
   if(!Copy1(hEma9_4, 0, h4, ema9)) return 0;
   if(!Copy1(hEma21_4, 0, h4, ema21)) return 0;
   if(ema9 > ema21) return 1;
   if(ema9 < ema21) return -1;
   return 0;
  }

int CollectPivotLows(const MqlRates &rates[], const int n, int &idxs[])
  {
   int count = 0;
   int left = PivotLeft;
   int right = PivotRight;
   for(int i = left; i < n - right; i++)
     {
      bool ok = true;
      for(int j = i - left; j < i; j++)
        {
         if(!(rates[i].low < rates[j].low)) { ok = false; break; }
        }
      if(!ok) continue;
      for(int j = i + 1; j <= i + right; j++)
        {
         if(!(rates[i].low <= rates[j].low)) { ok = false; break; }
        }
      if(!ok) continue;
      idxs[count++] = i;
     }
   return count;
  }

int CollectPivotHighs(const MqlRates &rates[], const int n, int &idxs[])
  {
   int count = 0;
   int left = PivotLeft;
   int right = PivotRight;
   for(int i = left; i < n - right; i++)
     {
      bool ok = true;
      for(int j = i - left; j < i; j++)
        {
         if(!(rates[i].high > rates[j].high)) { ok = false; break; }
        }
      if(!ok) continue;
      for(int j = i + 1; j <= i + right; j++)
        {
         if(!(rates[i].high >= rates[j].high)) { ok = false; break; }
        }
      if(!ok) continue;
      idxs[count++] = i;
     }
   return count;
  }

bool RecentPivotLow(const MqlRates &rates[], const int &idxs[], const int count,
                    const int before, int &idx, double &level)
  {
   for(int k = count - 1; k >= 0; k--)
     {
      if(idxs[k] < before)
        {
         idx = idxs[k];
         level = rates[idx].low;
         return true;
        }
     }
   return false;
  }

bool RecentPivotHigh(const MqlRates &rates[], const int &idxs[], const int count,
                     const int before, int &idx, double &level)
  {
   for(int k = count - 1; k >= 0; k--)
     {
      if(idxs[k] < before)
        {
         idx = idxs[k];
         level = rates[idx].high;
         return true;
        }
     }
   return false;
  }

int sweep_i_end(const int n, const int sweepI)
  {
   int last = sweepI + ChochLookback;
   if(last > n - 1) last = n - 1;
   return last;
  }

int ChochCloseAbove(const MqlRates &rates[], const int n, const int sweepI,
                     const double level)
  {
   int last = sweep_i_end(n, sweepI);
   for(int i = sweepI + 1; i <= last; i++)
     {
      if(rates[i].close > level) return i;
     }
   return -1;
  }

int ChochCloseBelow(const MqlRates &rates[], const int n, const int sweepI,
                     const double level)
  {
   int last = sweep_i_end(n, sweepI);
   for(int i = sweepI + 1; i <= last; i++)
     {
      if(rates[i].close < level) return i;
     }
   return -1;
  }

bool DetectAt(const int confirmShift, SmcSetup &setup)
  {
   if(confirmShift < 1) return false;
   int lookback = StructureLookback;
   if(lookback < 25) lookback = 25;

   MqlRates rates[];
   ArraySetAsSeries(rates, false);
   int n = CopyRates(_Symbol, PERIOD_H1, confirmShift, lookback, rates);
   if(n < 25) return false;

   double atr = 0.0;
   double adx = 0.0;
   if(!Copy1(hAtr1, 0, confirmShift, atr) || atr <= 0.0) return false;
   if(!Copy1(hAdx1, 0, confirmShift, adx)) return false;
   if(adx < AdxTrendMin) return false;

   int bias = HtfBiasAt(confirmShift);
   double entry = rates[n - 1].close;
   int lastI = n - 1;
   int sweepStart = n - SweepLookback;
   if(sweepStart < 0) sweepStart = 0;

   int lows[], highs[];
   ArrayResize(lows, n);
   ArrayResize(highs, n);
   int nLows = CollectPivotLows(rates, n, lows);
   int nHighs = CollectPivotHighs(rates, n, highs);
   if(nLows <= 0 || nHighs <= 0) return false;

   for(int sweepI = n - 2; sweepI >= sweepStart; sweepI--)
     {
      int pIdx = -1;
      double swingLow = 0.0;
      if(!RecentPivotLow(rates, lows, nLows, sweepI, pIdx, swingLow)) continue;
      if(rates[sweepI].low >= swingLow || rates[sweepI].close <= swingLow) continue;
      if(swingLow - rates[sweepI].low < MinSweepAtrFrac * atr) continue;
      int dummy = -1;
      double swingHigh = 0.0;
      if(!RecentPivotHigh(rates, highs, nHighs, sweepI, dummy, swingHigh)) continue;
      int chochI = ChochCloseAbove(rates, n, sweepI, swingHigh);
      if(chochI < 0) continue;
      if(lastI - chochI > MaxBarsSinceChoch) continue;
      if(bias < 0) continue;
      double stop = rates[sweepI].low - StopAtrBuffer * atr;
      if(!(stop < entry) || !RiskOk(entry, stop, atr)) continue;
      setup.direction = "long";
      setup.structure = "bullish_choch";
      setup.entry = entry;
      setup.stop = stop;
      FillRTargets(entry, stop, true, setup.tp1, setup.tp2, setup.tp3);
      setup.sweep_level = swingLow;
      setup.choch_level = swingHigh;
      setup.sweep_ext = rates[sweepI].low;
      setup.atr = atr;
      setup.adx = adx;
      setup.sweep_time = rates[sweepI].time;
      setup.choch_time = rates[chochI].time;
      setup.bias = bias;
      return true;
     }

   for(int sweepI = n - 2; sweepI >= sweepStart; sweepI--)
     {
      int pIdx = -1;
      double swingHigh = 0.0;
      if(!RecentPivotHigh(rates, highs, nHighs, sweepI, pIdx, swingHigh)) continue;
      if(rates[sweepI].high <= swingHigh || rates[sweepI].close >= swingHigh) continue;
      if(rates[sweepI].high - swingHigh < MinSweepAtrFrac * atr) continue;
      int dummy = -1;
      double swingLow = 0.0;
      if(!RecentPivotLow(rates, lows, nLows, sweepI, dummy, swingLow)) continue;
      int chochI = ChochCloseBelow(rates, n, sweepI, swingLow);
      if(chochI < 0) continue;
      if(lastI - chochI > MaxBarsSinceChoch) continue;
      if(bias > 0) continue;
      double stop = rates[sweepI].high + StopAtrBuffer * atr;
      if(!(stop > entry) || !RiskOk(entry, stop, atr)) continue;
      setup.direction = "short";
      setup.structure = "bearish_choch";
      setup.entry = entry;
      setup.stop = stop;
      FillRTargets(entry, stop, false, setup.tp1, setup.tp2, setup.tp3);
      setup.sweep_level = swingHigh;
      setup.choch_level = swingLow;
      setup.sweep_ext = rates[sweepI].high;
      setup.atr = atr;
      setup.adx = adx;
      setup.sweep_time = rates[sweepI].time;
      setup.choch_time = rates[chochI].time;
      setup.bias = bias;
      return true;
     }
   return false;
  }

void BackfillHistoryPins()
  {
   if(!ShowSignalPins || HistoryPinBars <= 0) return;
   int bars = Bars(_Symbol, PERIOD_H1);
   int maxShift = HistoryPinBars;
   if(maxShift > bars - MinBars - 5)
      maxShift = bars - MinBars - 5;
   if(maxShift < 1) return;

   int pinned = 0;
   for(int s = maxShift; s >= 1; s--)
     {
      SmcSetup setup;
      if(!DetectAt(s, setup)) continue;
      PinSignal(setup, s, false);
      pinned++;
     }
   lastStatus = StringFormat("history pins:%d (no push)", pinned);
   Print("KiarosSMC: ", lastStatus);
   ChartRedraw(0);
  }

bool Publish(const SmcSetup &setup)
  {
   if(StringLen(WebhookSecret) < 8)
     {
      lastStatus = "set WebhookSecret";
      return false;
     }
   datetime barTime = iTime(_Symbol, PERIOD_H1, 1);
   string biasStr = setup.bias > 0 ? "up" : (setup.bias < 0 ? "down" : "neutral");
   string extKey = setup.direction == "long" ? "sweep_low" : "sweep_high";
   long sweepMs = (long)setup.sweep_time * 1000;
   long chochMs = (long)setup.choch_time * 1000;
   string body = StringFormat(
      "{\"symbol\":\"%s\",\"timeframe\":\"smc\",\"direction\":\"%s\","
      "\"entry\":%.5f,\"stop_loss\":%.5f,\"take_profit\":%.5f,"
      "\"take_profit_2\":%.5f,\"take_profit_3\":%.5f,\"confidence\":%d,"
      "\"rationale\":\"Taught SMC ict_smc (H4 %s, MT5 EA live)\","
      "\"bar_time\":%d,"
      "\"indicators\":{\"strategy\":\"ict_smc\",\"structure\":\"%s\","
      "\"sweep_level\":%.5f,\"choch_level\":%.5f,\"%s\":%.5f,"
      "\"atr\":%.5f,\"adx\":%.2f,\"sweep_time\":%s,\"choch_time\":%s,"
      "\"htf_trend\":\"%s\",\"source\":\"mt5_ea\",\"doctrine\":\"taught_mtf\"}}",
      AppSymbol, setup.direction, setup.entry, setup.stop, setup.tp1, setup.tp2,
      setup.tp3, Confidence, biasStr, (int)barTime, setup.structure,
      setup.sweep_level, setup.choch_level, extKey, setup.sweep_ext,
      setup.atr, setup.adx, IntegerToString(sweepMs), IntegerToString(chochMs),
      biasStr);

   string resp = "";
   lastHttp = HttpPost(SignalApiUrl, body, resp);
   if(lastHttp == 200)
     {
      signalsOk++;
      string signalId = ExtractJsonString(resp, "id");
      lastStatus = "published ict_smc " + setup.direction;
      if(StringLen(signalId) > 0)
        {
         if(UploadSetupChart(signalId))
            lastStatus = lastStatus + " +chart";
         else
            lastStatus = lastStatus + " (chart fail)";
        }
      return true;
     }
   if(lastHttp == 409)
     {
      signalsSkip++;
      lastStatus = "skip: open signal exists";
      return false;
     }
   signalsFail++;
   if(lastHttp == -1)
      lastStatus = StringFormat("WebRequest err %d", GetLastError());
   else
      lastStatus = StringFormat("HTTP %d", lastHttp);
   Print("KiarosSMC: ", lastStatus);
   return false;
  }

void UpdateComment()
  {
   Comment(StringFormat(
      "KiarosSMC | ok:%d fail:%d skip:%d | %s | lastH1:%s",
      signalsOk, signalsFail, signalsSkip, lastStatus,
      TimeToString(lastEvaluatedBar, TIME_DATE|TIME_MINUTES)));
  }

int OnInit()
  {
   if(_Symbol != AppSymbol && StringFind(_Symbol, "XAU") < 0 && StringFind(_Symbol, "GOLD") < 0)
      Print("KiarosSMC: attach on XAU/GOLD chart (AppSymbol=", AppSymbol, ")");

   hAtr1 = iATR(_Symbol, PERIOD_H1, 14);
   hAdx1 = iADX(_Symbol, PERIOD_H1, 14);
   hEma9_4 = iMA(_Symbol, PERIOD_H4, 9, 0, MODE_EMA, PRICE_CLOSE);
   hEma21_4 = iMA(_Symbol, PERIOD_H4, 21, 0, MODE_EMA, PRICE_CLOSE);

   if(hAtr1 == INVALID_HANDLE || hAdx1 == INVALID_HANDLE ||
      hEma9_4 == INVALID_HANDLE || hEma21_4 == INVALID_HANDLE)
     {
      Print("KiarosSMC: indicator init failed");
      return INIT_FAILED;
     }

   UpdateComment();
   return INIT_SUCCEEDED;
  }

void OnDeinit(const int reason)
  {
   PinsClear();
   IndicatorRelease(hAtr1);
   IndicatorRelease(hAdx1);
   IndicatorRelease(hEma9_4);
   IndicatorRelease(hEma21_4);
   Comment("");
  }

void OnTick()
  {
   if(Bars(_Symbol, PERIOD_H1) < MinBars + 5) return;
   if(Bars(_Symbol, PERIOD_H4) < 30) return;

   if(!historyDone)
     {
      BackfillHistoryPins();
      lastEvaluatedBar = iTime(_Symbol, PERIOD_H1, 1);
      historyDone = true;
      UpdateComment();
      return;
     }

   datetime barTime = iTime(_Symbol, PERIOD_H1, 1);
   if(barTime == 0 || barTime == lastEvaluatedBar) return;
   lastEvaluatedBar = barTime;

   int bias = HtfBiasAt(1);
   SmcSetup setup;
   bool found = DetectAt(1, setup);

   if(found)
     {
      PinSignal(setup, 1, true);
      Publish(setup);
     }
   else
      lastStatus = StringFormat("no setup (H4 %s)",
         bias > 0 ? "up" : (bias < 0 ? "down" : "flat"));

   UpdateComment();
  }
