# MT5 deployment setup

The EAs connect to `https://kairos-web-sandy.vercel.app`:

| EA | Version | Default endpoints |
| --- | --- | --- |
| KiarosTickPush | 1.30 | `/api/mt5/tick`, `/api/mt5/candles`, `/api/mt5/charts/pending`, `/api/mt5/chart` |
| KiarosBBMA | 1.06 | `/api/mt5/signal`, `/api/mt5/chart` |
| KiarosSMC | 1.01 | `/api/mt5/signal`, `/api/mt5/chart` |

1. Copy the updated `.mq5` files into the terminal's `MQL5/Experts` folder and compile them in MetaEditor.
2. In **Tools → Options → Expert Advisors**, enable **Allow WebRequest for listed URL** and add `https://kairos-web-sandy.vercel.app`.
3. Reattach each EA or open its inputs. Existing chart settings and saved `.set` presets can retain the old URLs, so reset the inputs to the new defaults or update every API URL manually.
4. Set `WebhookSecret` to the `MT5_WEBHOOK_SECRET` configured in the Vercel production project. This value is intentionally absent from the distributed source. An EA with a missing or too-short key stops initialization before making requests.
5. Keep KiarosTickPush attached to the broker's gold chart for tick and candle delivery. Run BBMA and SMC on their own charts as before.

The copies in `web/public/tools/` must stay identical to the sources in this directory. Changing deployment URLs does not change the strategy rules or the market data sent to the API.

The previously distributed source contained the webhook key. Rotate it in Vercel when all running EA inputs can be updated together; removing it from these files does not invalidate earlier copies.
