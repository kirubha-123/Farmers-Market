import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { api } from '../api';
import Footer from '../components/Footer';
import './MarketPricesPage.css';

const MARKET_TA = {
  Ariyalur: 'அரியலூர்',
  Chengalpattu: 'செங்கல்பட்டு',
  Chennai: 'சென்னை',
  Coimbatore: 'கோயம்புத்தூர்',
  Cuddalore: 'கடலூர்',
  Dharmapuri: 'தருமபுரி',
  Dindigul: 'திண்டுக்கல்',
  Erode: 'ஈரோடு',
  Kallakurichi: 'கள்ளக்குறிச்சி',
  Kanchipuram: 'காஞ்சிபுரம்',
  Kanyakumari: 'கன்னியாகுமரி',
  Karur: 'கரூர்',
  Krishnagiri: 'கிருஷ்ணகிரி',
  Koyambedu: 'கோயம்பேடு',
  Madurai: 'மதுரை',
  Mayiladuthurai: 'மயிலாடுதுறை',
  Nagapattinam: 'நாகப்பட்டினம்',
  Namakkal: 'நாமக்கல்',
  Nilgiris: 'நீலகிரி',
  Perambalur: 'பெரம்பலூர்',
  Pollachi: 'பொள்ளாச்சி',
  Pudukkottai: 'புதுக்கோட்டை',
  Ramanathapuram: 'ராமநாதபுரம்',
  Ranipet: 'ராணிப்பேட்டை',
  Salem: 'சேலம்',
  Sivaganga: 'சிவகங்கை',
  Tenkasi: 'தென்காசி',
  Thanjavur: 'தஞ்சாவூர்',
  Theni: 'தேனி',
  Thoothukudi: 'தூத்துக்குடி',
  Trichy: 'திருச்சி',
  Tirunelveli: 'திருநெல்வேலி',
  Tirupathur: 'திருப்பத்தூர்',
  Tiruppur: 'திருப்பூர்',
  Thiruvallur: 'திருவள்ளூர்',
  Tiruvallur: 'திருவள்ளூர்',
  Tiruvannamalai: 'திருவண்ணாமலை',
  Tiruvarur: 'திருவாரூர்',
  Vellore: 'வேலூர்',
  Villupuram: 'விழுப்புரம்',
  Virudhunagar: 'விருதுநகர்'
};

const CROP_TA = {
  'Amaranth Leaves': 'அரைக்கீரை',
  Amla: 'நெல்லிக்காய்',
  Apple: 'ஆப்பிள்',
  'Ash Gourd': 'வெள்ளை பூசணி',
  'Baby Corn': 'இளம் சோளம்',
  Banana: 'வாழைப்பழம்',
  'Banana Flower': 'வாழைப்பூ',
  Beetroot: 'பீட்ரூட்',
  'Bitter Gourd': 'பாகற்காய்',
  'Bottle Gourd': 'சுரைக்காய்',
  Brinjal: 'கத்திரிக்காய்',
  'Broad Beans': 'அவரைக்காய்',
  'Butter Beans': 'மொச்சைக்காய்',
  Cabbage: 'முட்டைக்கோஸ்',
  Capsicum: 'குடைமிளகாய்',
  Carrot: 'காரட்',
  Cauliflower: 'காலிஃபிளவர்',
  Chilli: 'மிளகாய்',
  'Cluster Beans': 'கொத்தவரங்காய்',
  Coconut: 'தேங்காய்',
  Colocasia: 'சேப்பங்கிழங்கு',
  'Colocasia Leaves': 'சேப்பங்கிழங்கு இலை',
  Corn: 'சோளம்',
  Coriander: 'கொத்தமல்லி',
  'Coriander Leaves': 'கொத்தமல்லி இலை',
  Cotton: 'பருத்தி',
  Cucumber: 'வெள்ளரிக்காய்',
  'Curry Leaves': 'கறிவேப்பிலை',
  'Dill Leaves': 'சதகுப்பை இலை',
  Drumsticks: 'முருங்கைக்காய்',
  'Elephant Yam': 'கருணைக்கிழங்கு',
  'Fenugreek Leaves': 'வெந்தயக் கீரை',
  'French Beans': 'பீன்ஸ்',
  Garlic: 'பூண்டு',
  Ginger: 'இஞ்சி',
  'Green Chilli': 'பச்சை மிளகாய்',
  'Green Peas': 'பட்டாணி',
  Groundnut: 'வேர்க்கடலை',
  'Ivy Gourd': 'கோவைக்காய்',
  'Ladies Finger': 'வெண்டைக்காய்',
  Lemon: 'எலுமிச்சை',
  Mango: 'மாம்பழம்',
  'Mango Raw': 'பச்சை மாங்காய்',
  'Mint Leaves': 'புதினா இலை',
  Mushroom: 'காளான்',
  'Mustard Leaves': 'கடுகுக் கீரை',
  Onion: 'வெங்காயம்',
  'Onion Big': 'பெரிய வெங்காயம்',
  'Onion Green': 'வெங்காயத்தாள்',
  'Onion Small': 'சின்ன வெங்காயம்',
  Potato: 'உருளைக்கிழங்கு',
  Pumpkin: 'பூசணிக்காய்',
  'Raw Banana': 'வாழைக்காய்',
  Radish: 'முள்ளங்கி',
  Rice: 'அரிசி',
  'Ridge Gourd': 'பீர்க்கங்காய்',
  Shallot: 'சின்ன வெங்காயம்',
  'Snake Gourd': 'புடலங்காய்',
  'Sorrel Leaves': 'புளிச்சைக்கீரை',
  Spinach: 'பசலைக் கீரை',
  Sugarcane: 'கரும்பு',
  'Sweet Potato': 'சர்க்கரைவள்ளிக்கிழங்கு',
  Tomato: 'தக்காளி',
  Turmeric: 'மஞ்சள்'
};

  function withTamilLabel(value, map) {
    const ta = map[value];
    return ta ? `${value} (${ta})` : value;
  }

  function getTamilCrop(value) {
    if (CROP_TA[value]) return CROP_TA[value];
    const normalized = value.toLowerCase();
    const exact = Object.keys(CROP_TA).find((k) => k.toLowerCase() === normalized);
    return exact ? CROP_TA[exact] : '';
  }
const MarketPricesPage = () => {
  const navigate = useNavigate();

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultFrom = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 14);
    return start.toISOString().slice(0, 10);
  }, []);

  const [viewMode, setViewMode] = useState('today');

  const [markets, setMarkets] = useState([]);
  const [market, setMarket] = useState('Chennai');
  const [date, setDate] = useState(todayIso);

  const [crops, setCrops] = useState([]);
  const [crop, setCrop] = useState('Tomato');
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(todayIso);

  const [todayRows, setTodayRows] = useState([]);
  const [historyRows, setHistoryRows] = useState([]);
  const [todaySource, setTodaySource] = useState('');
  const [historySource, setHistorySource] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [liveChangedCrops, setLiveChangedCrops] = useState([]);
  const [lastLiveChangeAt, setLastLiveChangeAt] = useState('');
  const [connectionError, setConnectionError] = useState(null);
  const [todayError, setTodayError] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  const REFRESH_SECONDS = 60;
  const prevTodaySnapshotRef = useRef(new Map());
  const liveHighlightTimerRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'farmer') {
      navigate('/');
      return;
    }

    loadMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (!market || !date) return;
    loadTodayPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, date]);

  useEffect(() => {
    if (!market) return;
    loadCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market]);

  useEffect(() => {
    if (viewMode !== 'history') return;
    if (!market || !crop || !fromDate || !toDate) return;
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, crop, fromDate, toDate, viewMode]);

  useEffect(() => {
    if (!connectionError) return;

    const retryTimer = setInterval(() => {
      loadMarkets();
    }, 10000);

    return () => clearInterval(retryTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionError]);

  useEffect(() => {
    if (!autoRefreshEnabled) return;
    if (viewMode !== 'today') return;
    if (!market || !date || connectionError) return;

    const timer = setInterval(() => {
      loadTodayPrices();
    }, REFRESH_SECONDS * 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshEnabled, viewMode, market, date, connectionError]);

  const loadMarkets = async () => {
    setConnectionError(null);

    try {
      const response = await api.get('/market-prices/markets');
      const serverMarkets = response.data?.markets || [];
      setMarkets(serverMarkets);

      if (serverMarkets.length > 0) {
        setMarket(serverMarkets.includes('Chennai') ? 'Chennai' : serverMarkets[0]);
      }
    } catch (err) {
      setConnectionError('Backend not reachable. Start server with: cd server && npm start');
      setMarkets([]);
    }
  };

  const loadCrops = async () => {
    setHistoryError(null);

    try {
      const response = await api.get('/market-prices/crops', { params: { market } });
      const serverCrops = response.data?.crops || [];

      setCrops(serverCrops);
      if (!serverCrops.length) {
        setCrop('');
        return;
      }

      if (!serverCrops.includes(crop)) {
        setCrop(serverCrops.includes('Tomato') ? 'Tomato' : serverCrops[0]);
      }
    } catch (err) {
      setConnectionError('Backend not reachable. Start server with: cd server && npm start');
      setCrops([]);
    }
  };

  const loadTodayPrices = async () => {
    setLoadingToday(true);
    setTodayError(null);

    try {
      const response = await api.get('/market-prices/today', {
        params: { market, date }
      });

      const nextRows = response.data?.rows || [];
      const nextSnapshot = new Map();
      nextRows.forEach((row) => {
        const signature = `${row.minPrice}|${row.modalPrice}|${row.maxPrice}|${row.unit}`;
        nextSnapshot.set(row.crop, signature);
      });

      const changedCrops = [];
      if (prevTodaySnapshotRef.current.size > 0) {
        nextRows.forEach((row) => {
          const prevSignature = prevTodaySnapshotRef.current.get(row.crop);
          const nextSignature = nextSnapshot.get(row.crop);
          if (prevSignature && prevSignature !== nextSignature) {
            changedCrops.push(row.crop);
          }
        });
      }

      prevTodaySnapshotRef.current = nextSnapshot;
      setTodayRows(nextRows);

      if (changedCrops.length > 0) {
        setLiveChangedCrops(changedCrops);
        setLastLiveChangeAt(new Date().toISOString());

        if (liveHighlightTimerRef.current) {
          clearTimeout(liveHighlightTimerRef.current);
        }
        liveHighlightTimerRef.current = setTimeout(() => {
          setLiveChangedCrops([]);
        }, 15000);
      }

      setTodaySource(response.data?.source || '');
      setLastUpdated(response.data?.lastUpdated || '');
    } catch (err) {
      setTodayRows([]);
      setTodaySource('offline');
      setLastUpdated('');
      setTodayError('Failed to load today market prices. Please ensure backend is running.');
    } finally {
      setLoadingToday(false);
    }
  };

  useEffect(() => {
    return () => {
      if (liveHighlightTimerRef.current) {
        clearTimeout(liveHighlightTimerRef.current);
      }
    };
  }, []);

  const loadHistory = async () => {
    if (!crop) {
      setHistoryError('Please select a crop to view history.');
      return;
    }

    if (fromDate > toDate) {
      setHistoryError('From date cannot be after To date.');
      return;
    }

    setLoadingHistory(true);
    setHistoryError(null);

    try {
      const response = await api.get('/market-prices/history', {
        params: {
          market,
          crop,
          from: fromDate,
          to: toDate
        }
      });

      setHistoryRows(response.data?.series || []);
      setHistorySource(response.data?.source || '');
    } catch (err) {
      setHistoryRows([]);
      setHistorySource('offline');
      setHistoryError('Failed to load history prices. Please ensure backend is running.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const marketOptions = markets.length ? markets : [market || 'Chennai'];
  const cropOptions = crops.length ? crops : [crop || 'Tomato'];

  const chartData = historyRows.map((item) => ({
    date: item.date,
    modal: item.modalPrice,
    min: item.minPrice,
    max: item.maxPrice
  }));

  const retryAll = () => {
    loadMarkets();
    if (viewMode === 'today') {
      loadTodayPrices();
      return;
    }
    loadHistory();
  };

  return (
    <div className="market-price-page">
      <div className="market-price-wrap">
        <section className="market-hero">
          <h1>Market Prices</h1>
          <p>
            Dedicated market price page with today rates and crop-wise price history.
            Auto-sync keeps data updated from configured sources.
          </p>
          <div className="market-meta-row">
            <span className="chip">Market: {market ? withTamilLabel(market, MARKET_TA) : 'N/A'}</span>
            <span className="chip">Date: {date}</span>
            <span className={`chip ${autoRefreshEnabled ? 'ok' : 'warn'}`}>
              Auto refresh: {autoRefreshEnabled ? `ON (${REFRESH_SECONDS}s)` : 'OFF'}
            </span>
            <span className={`chip ${liveChangedCrops.length > 0 ? 'ok' : ''}`}>
              Live changes: {liveChangedCrops.length}
            </span>
            <span className={`chip ${todaySource.includes('fallback') || todaySource === 'offline' ? 'warn' : 'ok'}`}>
              Source: {todaySource || 'loading'}
            </span>
            {lastUpdated && (
              <span className="chip">Updated: {new Date(lastUpdated).toLocaleString('en-IN')}</span>
            )}
            {lastLiveChangeAt && (
              <span className="chip ok">Last change: {new Date(lastLiveChangeAt).toLocaleTimeString('en-IN')}</span>
            )}
          </div>
          <div className="market-pills">
            {marketOptions.map((m) => (
              <button
                key={m}
                type="button"
                className={`market-pill ${m === market ? 'active' : ''}`}
                onClick={() => setMarket(m)}
              >
                {withTamilLabel(m, MARKET_TA)}
              </button>
            ))}
          </div>
        </section>

        <section className="controls-card">
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'today' ? 'active' : ''}`}
              onClick={() => setViewMode('today')}
            >
              Today Prices
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'history' ? 'active' : ''}`}
              onClick={() => setViewMode('history')}
            >
              Price History
            </button>
          </div>

          {viewMode === 'today' ? (
            <div className="controls-grid">
              <label>
                Market
                <select value={market} onChange={(e) => setMarket(e.target.value)}>
                  {marketOptions.map((m) => (
                    <option key={m} value={m}>{withTamilLabel(m, MARKET_TA)}</option>
                  ))}
                </select>
              </label>

              <label>
                Date
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>

              <button onClick={loadTodayPrices} className="btn-primary" disabled={loadingToday}>
                {loadingToday ? 'Loading...' : 'Refresh Today Prices'}
              </button>
              <button
                onClick={() => setAutoRefreshEnabled((prev) => !prev)}
                className="btn-primary"
                type="button"
              >
                {autoRefreshEnabled ? 'Disable Auto Refresh' : 'Enable Auto Refresh'}
              </button>
            </div>
          ) : (
            <div className="controls-grid history-controls">
              <label>
                Crop
                <select value={crop} onChange={(e) => setCrop(e.target.value)}>
                  {cropOptions.map((c) => (
                    <option key={c} value={c}>{withTamilLabel(c, CROP_TA)}</option>
                  ))}
                </select>
              </label>

              <label>
                From
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </label>

              <label>
                To
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </label>

              <button onClick={loadHistory} className="btn-primary" disabled={loadingHistory}>
                {loadingHistory ? 'Loading...' : 'Load History'}
              </button>
            </div>
          )}
        </section>

        {viewMode === 'today' ? (
          <section className="table-card">
            <div className="card-title-row">
              <h2>Today Price Table</h2>
              <p>{todayRows.length} crops</p>
            </div>

            {loadingToday ? (
              <p className="loading-text">Loading today prices...</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Crop / பயிர்</th>
                      <th>Min</th>
                      <th>Modal</th>
                      <th>Max</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayRows.map((row) => (
                      <tr
                        key={`${row.crop}-${row.date}`}
                        className={liveChangedCrops.includes(row.crop) ? 'row-live-changed' : ''}
                      >
                        <td>
                          <div>{row.crop}</div>
                          {getTamilCrop(row.crop) && <div className="ta-subtext">{getTamilCrop(row.crop)}</div>}
                          {row.observedAt && <div className="ta-subtext">Updated: {new Date(row.observedAt).toLocaleTimeString('en-IN')}</div>}
                        </td>
                        <td>Rs {row.minPrice}</td>
                        <td className="modal-cell">Rs {row.modalPrice}</td>
                        <td>Rs {row.maxPrice}</td>
                        <td>{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="history-card">
            <div className="card-title-row">
              <h2>Price History</h2>
              <p>Trend by crop and date range</p>
            </div>

            <div className="history-meta">
              <span className={`chip ${historySource.includes('fallback') || historySource === 'offline' ? 'warn' : 'ok'}`}>
                History source: {historySource || 'not loaded'}
              </span>
            </div>

            <div className="chart-wrap">
              {historyRows.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="modal" stroke="#ca8a04" strokeWidth={2} name="Modal" />
                    <Line type="monotone" dataKey="min" stroke="#0f766e" strokeWidth={1.8} name="Min" />
                    <Line type="monotone" dataKey="max" stroke="#b91c1c" strokeWidth={1.8} name="Max" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="loading-text">No history data for selected filters.</p>
              )}
            </div>

            {historyRows.length > 0 && (
              <div className="table-scroll history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Crop / பயிர்</th>
                      <th>Min</th>
                      <th>Modal</th>
                      <th>Max</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.map((row) => (
                      <tr key={`${row.date}-${row.crop}`}>
                        <td>{row.date}</td>
                        <td>
                          <div>{row.crop}</div>
                          {getTamilCrop(row.crop) && <div className="ta-subtext">{getTamilCrop(row.crop)}</div>}
                        </td>
                        <td>Rs {row.minPrice}</td>
                        <td className="modal-cell">Rs {row.modalPrice}</td>
                        <td>Rs {row.maxPrice}</td>
                        <td>{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {connectionError && (
          <p className="error-text">
            {connectionError}
            <button type="button" className="error-action-btn" onClick={retryAll}>Retry now</button>
          </p>
        )}
        {todayError && viewMode === 'today' && <p className="error-text">{todayError}</p>}
        {historyError && viewMode === 'history' && <p className="error-text">{historyError}</p>}

        <p className="disclaimer">
          Disclaimer: Prices may vary by quality, lot size, locality and transportation cost.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default MarketPricesPage;
