"""SMC is an MT5 EA live lane (like BBMA): stored timeframe=smc, not scanned."""
from signals.models import (
    ALL_SESSIONS,
    AUXILIARY_SESSIONS,
    TIMEFRAME_MINUTES,
    TRADING_SESSIONS,
    broker_interval,
    sessions_for_timeframes,
)


def test_smc_is_auxiliary_like_bbma_not_engine_scanned():
    by_scan = {s.name: s for s in TRADING_SESSIONS}
    by_aux = {s.name: s for s in AUXILIARY_SESSIONS}
    assert "smc" not in by_scan
    smc = by_aux["smc"]
    assert smc.timeframe == "smc"
    assert smc.strategy == "ict_smc"
    assert smc.max_open_days == 14
    assert TIMEFRAME_MINUTES["smc"] == 60


def test_smc_timeframe_does_not_collide_with_swing():
    tfs = [s.timeframe for s in ALL_SESSIONS]
    assert tfs.count("smc") == 1
    assert "1h" in tfs
    assert "smc" in tfs


def test_broker_interval_maps_synthetic_lanes_to_real_ohlc():
    assert broker_interval("smc") == "1h"
    assert broker_interval("bbma") == "1h"
    assert broker_interval("floor") == "15m"
    assert broker_interval("1h") == "1h"
    assert broker_interval("15m") == "15m"


def test_broker_interval_resolves_confluence_source():
    assert broker_interval("confluence", {"source_timeframe": "15m"}) == "15m"
    assert broker_interval("confluence", {"source_timeframe": "smc"}) == "1h"
    assert broker_interval("confluence", {}) == "1h"
    assert broker_interval("confluence") == "1h"


def test_fetch_interval_for_smc_row_is_1h():
    from signals.outcomes.tracker import fetch_interval_for_row

    assert fetch_interval_for_row({"timeframe": "smc", "symbol": "BTCUSD"}) == "1h"
    assert fetch_interval_for_row(
        {"timeframe": "confluence", "symbol": "BTCUSD",
         "indicators": {"source_timeframe": "smc"}},
    ) == "1h"


def test_1h_bar_close_does_not_scan_smc():
    due = sessions_for_timeframes(["1h"])
    names = [s.name for s in due]
    assert names == ["swing"]
    assert "smc" not in names
