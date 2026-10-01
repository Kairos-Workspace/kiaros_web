"""Post-store Telegram delivery."""
from signals.clients.telegram import send_alert
from signals.pipeline.dedup import with_retry


def maybe_send_alert(signal, settings, cfg):
    """Telegram alert for a stored signal; never raises — a failed or
    skipped alert must not affect the rest of the run.
    """
    if not cfg.telegram_bot_token or not cfg.telegram_channel_id:
        return
    ind = signal.indicators or {}
    if (
        signal.timeframe == "1h"
        and ind.get("strategy") == "msnr"
        and not getattr(signal, "chart_url", None)
    ):
        print(f"[{signal.symbol}] swing alert skipped — chart required")
        return
    if signal.confidence < settings.min_alert_confidence:
        print(f"[{signal.symbol}] confidence {signal.confidence} below alert "
              f"threshold {settings.min_alert_confidence}, no alert")
        return
    try:
        with_retry(lambda: send_alert(
            signal, cfg.telegram_bot_token, cfg.telegram_channel_id,
        ))
        print(f"[{signal.symbol}] Telegram alert sent")
    except Exception as exc:
        print(f"[{signal.symbol}] Telegram alert failed "
              f"({type(exc).__name__}), continuing")


# Telegram carries confirmed signals and TP/SL outcomes only. No-signal and
# rejected scans, and per-run summaries, stay in Supabase and the logs — they
# are noise in a channel people act on. The formatters for both still exist in
# signals.clients.telegram for ad-hoc use; this module deliberately never calls
# them, and tests/core/test_telegram.py asserts that.
