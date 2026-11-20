// =====================================================================
// DEPT — Cross-Client Pulse
// Internal Looker Data App: paid media spend & delivery across every client
// and every natively integrated platform, plus the health of the data flow.
//
// Model   : cross-client-pacing
// Explore : cross_channel_autopacing_perf_looker_dtable
// Runtime : Looker Data Apps 1.2.0 (Lit, light DOM)
// =====================================================================

import {
  DataApp,
  html,
  nothing,
} from 'https://www.gstatic.com/looker-data-apps/versions/1.2.0/data-app.js';

// ---------------------------------------------------------------- config
const MODEL = 'cross-client-pacing';
const EXPLORE = 'cross_channel_autopacing_perf_looker_dtable';
const V = EXPLORE + '.';
const F = (name) => V + name;

const PRESETS = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: 'mtd', label: 'MTD' },
  { id: 'qtd', label: 'QTD' },
  { id: 'ytd', label: 'YTD' },
  { id: 'lm', label: 'Last month' },
];

const TABS = [
  { id: 'pulse', label: 'Pulse' },
  { id: 'clients', label: 'Clients' },
  { id: 'platforms', label: 'Platforms' },
  { id: 'health', label: 'Data health' },
];

// Brand
const ORANGE = '#FF5A1F';
const INK = '#111111';
const GREY = '#B9B4AE';

// Platform identity colours — calm tones; orange is reserved for emphasis.
const PLATFORM_COLORS = {
  'Google': '#1E1E1E',
  'Facebook': '#7B5BE3',
  'Bing': '#2FB5BA',
  'Amazon': '#E7A33E',
  'LinkedIn': '#3D7BD9',
  'Apple': '#8C8681',
  'Criteo': '#D66BC9',
  'Yahoo Gemini': '#7CD992',
  'Twitter': '#5E5A56',
  'TikTok': '#C95773',
  'The Trade Desk': '#56BBE5',
  'DV360': '#B5C665',
  'SA360': '#D7D2CE',
};
const platformColor = (p) => PLATFORM_COLORS[p] || '#B9B0A9';

// DEPT marks (inlined: the tile CSP blocks remote images)
const ASTERISK_PATHS = html`
  <path d="M708.104 301.689V396.239H508.632L670.67 514.027L616.154 591.123L453.161 472.558L516.164 666.725L427.173 697.943L375.616 539.088C371.581 526.386 369.624 512.862 369.624 499.113C369.624 440.862 404.936 378.276 468.628 353.948V343.995C404.936 319.666 369.624 257.066 369.624 198.829C369.624 185.081 371.596 171.557 375.616 158.854L427.173 0L516.164 31.218L453.161 225.385L616.154 106.819L670.67 183.915L508.632 301.704H708.104V301.689Z"/>
  <path d="M0.239014 301.689V396.224H199.711L37.674 514.027L92.189 591.123L255.183 472.558L192.179 666.71L281.17 697.943L332.727 539.088C336.762 526.386 338.72 512.862 338.72 499.113C338.72 440.862 303.407 378.276 239.716 353.948V343.995C303.407 319.666 338.72 257.066 338.72 198.829C338.72 185.081 336.747 171.557 332.727 158.854L281.17 0L192.179 31.218L255.183 225.385L92.189 106.819L37.674 183.915L199.711 301.704H0.239014V301.689Z"/>`;
const asterisk = (cls) => html`<svg class=${cls} viewBox="0 0 709 698" aria-hidden="true">${ASTERISK_PATHS}</svg>`;
const deptLogo = () => html`
  <svg class="logo" viewBox="0 0 709 990" role="img" aria-label="DEPT">
    ${ASTERISK_PATHS}
    <path d="M365.918 795.034V989.23H418.356V929.9H449.425C497.694 929.9 528.732 911.43 528.732 862.46C528.732 813.49 497.694 795.034 449.425 795.034H365.918ZM444.12 889.33H418.326V835.59H444.12C465.474 835.59 474.351 843.42 474.351 862.46C474.351 881.5 465.489 889.33 444.12 889.33Z"/>
    <path d="M534.426 795.034V840.37H595.158V989.23H647.597V840.37H708.359V795.034H534.426Z"/>
    <path d="M250.999 911.73H338.899V869.74H250.999V839.24H348.628V795.019H198.575V989.22H351.108V945H250.984V911.72H251.014L250.999 911.73Z"/>
    <path d="M80.697 795.034H0V989.23H80.697C156.12 989.23 185.828 946.97 185.828 892.11C185.828 837.25 156.149 795.034 80.697 795.034ZM79.89 944.74H52.408V839.52H79.89C109.539 839.52 130.894 853.79 130.894 892.11C130.894 930.43 109.539 944.7 79.89 944.7V944.74Z"/>
  </svg>`;

// ---------------------------------------------------------------- helpers
const num = (v) => {
  if (v == null) return null;
  if (typeof v === 'object' && 'value' in v) v = v.value;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const str = (v) => (v != null && typeof v === 'object' && 'value' in v ? v.value : v);

const fmtMoney = (n) => {
  if (n == null) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return '$' + (n / 1e6).toFixed(a >= 1e7 ? 1 : 2) + 'M';
  if (a >= 1e4) return '$' + (n / 1e3).toFixed(0) + 'K';
  if (a >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
};
const fmtMoney2 = (n) => (n == null ? '—' : '$' + n.toFixed(2));
const fmtCount = (n) => {
  if (n == null) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (a >= 1e4) return (n / 1e3).toFixed(0) + 'K';
  if (a >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toLocaleString('en-US');
};
const fmtInt = (n) => (n == null ? '—' : Math.round(n).toLocaleString('en-US'));
const fmtPct = (n, d = 1) => (n == null ? '—' : (n * 100).toFixed(d) + '%');
const delta = (cur, prev) => (cur == null || prev == null || prev === 0 ? null : cur / prev - 1);

// Dates (local, day precision)
const DAY = 86400000;
const d0 = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getTime() + n * DAY);
const ymd = (d) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const lookerDate = (d) => ymd(d).replace(/-/g, '/');
const human = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const humanShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Periods are [start, endExclusive). "Today" is excluded: platforms land a day late.
function periodFor(preset, today = d0(new Date())) {
  const end = today; // exclusive → data through yesterday
  const y = addDays(end, -1);
  switch (preset) {
    case '7d': return { start: addDays(end, -7), end };
    case '30d': return { start: addDays(end, -30), end };
    case '90d': return { start: addDays(end, -90), end };
    case 'mtd': return { start: new Date(y.getFullYear(), y.getMonth(), 1), end };
    case 'qtd': return { start: new Date(y.getFullYear(), Math.floor(y.getMonth() / 3) * 3, 1), end };
    case 'ytd': return { start: new Date(y.getFullYear(), 0, 1), end };
    case 'lm': {
      const s = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      return { start: s, end: new Date(end.getFullYear(), end.getMonth(), 1) };
    }
    default: return { start: addDays(end, -30), end };
  }
}
function comparisonFor(p, mode) {
  if (mode === 'yoy') return { start: addDays(p.start, -364), end: addDays(p.end, -364) }; // weekday-aligned
  const len = Math.round((p.end - p.start) / DAY);
  return { start: addDays(p.start, -len), end: p.start };
}
const rangeFilter = (p) => `${lookerDate(p.start)} to ${lookerDate(p.end)}`;
const periodDays = (p) => Math.round((p.end - p.start) / DAY);

// Looker string filter escaping (comma, quotes, wildcards)
const escFilter = (s) =>
  String(s).replace(/\^/g, '^^').replace(/,/g, '^,').replace(/"/g, '^"').replace(/%/g, '^%').replace(/_/g, '^_').replace(/^-/, '^-');

const KPI_FIELDS = ['cost', 'impressions', 'clicks', 'cpc', 'cpm', 'ctr', 'clients_count', 'platforms_count', 'accounts_count', 'campaigns_count'].map(F);

// =====================================================================
class DeptCrossClientPulse extends DataApp {
  static properties = {
    ...DataApp.properties,
    tab: { state: true },
    preset: { state: true },
    compare: { state: true },
    platform: { state: true },
    client: { state: true },
    data: { state: true },
    busy: { state: true },
    err: { state: true },
    platformOptions: { state: true },
    clientOptions: { state: true },
    sortKey: { state: true },
  };

  constructor() {
    super();
    this.lookerModel = MODEL;
    this.tab = 'pulse';
    this.preset = '30d';
    this.compare = 'prev';
    this.platform = '';
    this.client = '';
    this.data = {};
    this.busy = {};
    this.err = null;
    this.platformOptions = [];
    this.clientOptions = [];
    this.sortKey = 'cost';
    this._token = 0;
  }

  connectedCallback() {
    injectStyles();
    super.connectedCallback();
  }

  firstUpdated() {
    this._loadOptions();
    this._load();
  }

  // ---------------------------------------------------------------- state changes
  _set(patch) {
    Object.assign(this, patch);
    this._load();
  }

  get period() { return periodFor(this.preset); }
  get prior() { return comparisonFor(this.period, this.compare); }

  _baseFilters(extra = {}) {
    const f = { [F('include_in_totals')]: 'Yes' };
    if (this.platform) f[F('platform')] = escFilter(this.platform);
    if (this.client) f[F('client_name')] = escFilter(this.client);
    return { ...f, ...extra };
  }

  _q(fields, filters, sorts, limit = '500') {
    return this.runQuery({
      model: MODEL,
      explore: EXPLORE,
      fields: fields.map((x) => (x.includes('.') ? x : F(x))),
      filters,
      sorts: sorts ? sorts.map((s) => (s.includes('.') ? s : F(s))) : undefined,
      limit: String(limit),
    });
  }

  async _loadOptions() {
    try {
      const since = rangeFilter({ start: addDays(d0(new Date()), -400), end: d0(new Date()) });
      const [plats, clients] = await Promise.all([
        this._q(['platform', 'cost'], { [F('report_date')]: since, [F('include_in_totals')]: 'Yes' }, ['cost desc'], 100),
        this._q(['client_name', 'cost'], { [F('report_date')]: since, [F('include_in_totals')]: 'Yes' }, ['cost desc'], 1000),
      ]);
      this.platformOptions = plats.map((r) => str(r[F('platform')])).filter(Boolean);
      this.clientOptions = clients.map((r) => str(r[F('client_name')])).filter(Boolean);
    } catch (e) {
      // options are a convenience; the main load reports errors
    }
  }

  async _load() {
    const token = ++this._token;
    const tab = this.tab;
    this.busy = { ...this.busy, [tab]: true };
    this.err = null;
    try {
      const loader = {
        pulse: () => this._loadPulse(),
        clients: () => this._loadClients(),
        platforms: () => this._loadPlatforms(),
        health: () => this._loadHealth(),
      }[tab];
      const result = await loader();
      if (token !== this._token) return;
      this.data = { ...this.data, [tab]: result };
    } catch (e) {
      if (token !== this._token) return;
      this.err = e;
    } finally {
      if (token === this._token) this.busy = { ...this.busy, [tab]: false };
    }
  }

  // ---------------------------------------------------------------- loaders
  async _kpis() {
    const cur = this.period, pri = this.prior;
    const [a, b] = await Promise.all([
      this._q(KPI_FIELDS, this._baseFilters({ [F('report_date')]: rangeFilter(cur) })),
      this._q(KPI_FIELDS, this._baseFilters({ [F('report_date')]: rangeFilter(pri) })),
    ]);
    const pick = (rows) => Object.fromEntries(KPI_FIELDS.map((k) => [k.slice(V.length), num(rows[0]?.[k])]));
    return { cur: pick(a), prev: pick(b) };
  }

  _grain() {
    const d = periodDays(this.period);
    return d <= 45 ? 'date' : d <= 200 ? 'week' : 'month';
  }

  async _trend(measure = 'cost') {
    const grain = this._grain();
    const dim = F('report_' + grain);
    const run = (p) =>
      this._q([dim, F(measure)], this._baseFilters({ [F('report_date')]: rangeFilter(p) }), [dim + ' asc'], 1000);
    const [a, b] = await Promise.all([run(this.period), run(this.prior)]);
    const len = Math.max(a.length, b.length);
    const rows = [];
    for (let i = 0; i < len; i++) {
      const label = a[i] ? this._label(str(a[i][dim]), grain) : `+${i}`;
      rows.push({
        'x.period': label,
        'x.this_period': a[i] ? num(a[i][F(measure)]) : null,
        [this.compare === 'yoy' ? 'x.last_year' : 'x.previous_period']: b[i] ? num(b[i][F(measure)]) : null,
      });
    }
    return { grain, rows };
  }

  _label(v, grain) {
    if (!v) return '';
    if (grain === 'month') {
      const [y, m] = String(v).split('-').map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    const [y, m, d] = String(v).split('-').map(Number);
    return humanShort(new Date(y, m - 1, d));
  }

  async _byDim(dim, extraFields = [], limit = 500, filters = {}) {
    const fields = [F(dim), F('cost'), ...extraFields.map(F)];
    const run = (p) =>
      this._q(fields, this._baseFilters({ [F('report_date')]: rangeFilter(p), ...filters }), ['cost desc'], limit);
    const [a, b] = await Promise.all([run(this.period), run(this.prior)]);
    const prevMap = new Map(b.map((r) => [str(r[F(dim)]), num(r[F('cost')])]));
    return a.map((r) => {
      const o = { key: str(r[F(dim)]) || '(none)', cost: num(r[F('cost')]), prev: prevMap.get(str(r[F(dim)])) ?? null };
      for (const ef of extraFields) o[ef] = num(r[F(ef)]);
      return o;
    });
  }

  async _loadPulse() {
    const [kpi, trend, platforms, clients] = await Promise.all([
      this._kpis(),
      this._trend('cost'),
      this._byDim('platform', ['clicks', 'impressions'], 50),
      this._byDim('client_name', [], 1000),
    ]);
    const movers = clients
      .map((c) => ({ ...c, abs: (c.cost || 0) - (c.prev || 0) }))
      .filter((c) => Math.abs(c.abs) > 0);
    const up = [...movers].sort((x, y) => y.abs - x.abs).slice(0, 5);
    const down = [...movers].sort((x, y) => x.abs - y.abs).slice(0, 5).filter((c) => c.abs < 0);
    return { kpi, trend, platforms, up, down, clientCount: clients.length };
  }

  async _loadClients() {
    const cur = this.period;
    const [rows, mixRaw] = await Promise.all([
      this._byDim('client_name', ['clicks', 'impressions', 'platforms_count', 'accounts_count', 'cpc', 'ctr'], 1000),
      this._q(
        [F('client_name'), F('platform'), F('cost')],
        this._baseFilters({ [F('report_date')]: rangeFilter(cur) }),
        ['cost desc'],
        5000,
      ),
    ]);
    const total = rows.reduce((s, r) => s + (r.cost || 0), 0);
    const sorted = [...rows].sort((a, b) => (b.cost || 0) - (a.cost || 0));
    let cum = 0, n80 = 0;
    for (const r of sorted) { cum += r.cost || 0; n80++; if (cum >= total * 0.8) break; }
    const top10 = sorted.slice(0, 10).reduce((s, r) => s + (r.cost || 0), 0);
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)].cost : null;
    // platform mix for top 12 clients (stacked %)
    const topNames = sorted.slice(0, 12).map((r) => r.key);
    const plats = [...new Set(mixRaw.map((r) => str(r[F('platform')])))];
    const mix = topNames.map((name) => {
      const row = { 'm.client': name };
      for (const p of plats) row['m.' + p.replace(/\s+/g, '_')] = 0;
      for (const r of mixRaw) {
        if (str(r[F('client_name')]) === name) row['m.' + str(r[F('platform')]).replace(/\s+/g, '_')] += num(r[F('cost')]) || 0;
      }
      return row;
    });
    return { rows: sorted, total, n80, top10Share: total ? top10 / total : null, median, mix, mixPlatforms: plats };
  }

  async _loadPlatforms() {
    const cur = this.period;
    const grain = this._grain();
    const dim = F('report_' + grain);
    const [kpi, plats, channels, over, isCur, isPrev, isClients] = await Promise.all([
      this._kpis(),
      this._byDim('platform', ['impressions', 'clicks', 'cpc', 'cpm', 'ctr', 'clients_count', 'accounts_count'], 50),
      this._byDim('channel', [], 20),
      this._q([dim, F('platform'), F('cost')], this._baseFilters({ [F('report_date')]: rangeFilter(cur) }), [dim + ' asc'], 5000),
      this._q(
        [F('search_impression_share'), F('search_lost_is_budget'), F('search_lost_is_rank'), F('is_eligible_impressions')],
        this._baseFilters({ [F('report_date')]: rangeFilter(cur), [F('is_eligible_impressions')]: '>0' }),
      ),
      this._q(
        [F('search_impression_share'), F('search_lost_is_budget'), F('search_lost_is_rank')],
        this._baseFilters({ [F('report_date')]: rangeFilter(this.prior), [F('is_eligible_impressions')]: '>0' }),
      ),
      this._q(
        [F('client_name'), F('cost'), F('search_impression_share'), F('search_lost_is_budget'), F('search_lost_is_rank')],
        this._baseFilters({ [F('report_date')]: rangeFilter(cur), [F('is_eligible_impressions')]: '>0' }),
        ['cost desc'],
        10,
      ),
    ]);
    // stacked spend by period x platform
    const periods = [...new Set(over.map((r) => str(r[dim])))].sort();
    const platNames = [...new Set(over.map((r) => str(r[F('platform')])))];
    const stack = periods.map((p) => {
      const row = { 's.period': this._label(p, grain) };
      for (const pl of platNames) row['s.' + pl.replace(/\s+/g, '_')] = 0;
      for (const r of over) if (str(r[dim]) === p) row['s.' + str(r[F('platform')]).replace(/\s+/g, '_')] += num(r[F('cost')]) || 0;
      return row;
    });
    const isRow = (rows) => rows[0] ? {
      is: num(rows[0][F('search_impression_share')]),
      budget: num(rows[0][F('search_lost_is_budget')]),
      rank: num(rows[0][F('search_lost_is_rank')]),
    } : {};
    const isByClient = isClients.map((r) => ({
      'i.client': str(r[F('client_name')]),
      'i.captured': num(r[F('search_impression_share')]) || 0,
      'i.lost_to_budget': num(r[F('search_lost_is_budget')]) || 0,
      'i.lost_to_rank': num(r[F('search_lost_is_rank')]) || 0,
    }));
    return { kpi, plats, channels, stack, platNames, is: isRow(isCur), isPrev: isRow(isPrev), isByClient };
  }

  async _loadHealth() {
    const today = d0(new Date());
    const last60 = { start: addDays(today, -60), end: addDays(today, 1) };
    const cur = this.period;
    const plat = this.platform ? { [F('platform')]: escFilter(this.platform) } : {};
    const [fresh, daily, size, quality, unmapped] = await Promise.all([
      this._q(
        [F('platform'), F('data_source'), F('last_data_date'), F('days_since_last_data'), F('accounts_count'), F('cost_all_sources')],
        { [F('report_date')]: rangeFilter(last60), ...plat },
        [F('platform') + ' asc'],
        200,
      ),
      this._q([F('platform'), F('report_date'), F('row_count')], { [F('report_date')]: rangeFilter(last60), ...plat }, [F('report_date') + ' asc'], 5000),
      this._q(
        [F('platform'), F('row_count'), F('clients_count'), F('accounts_count'), F('campaigns_count'), F('days_with_data'), F('cost_all_sources')],
        { [F('report_date')]: rangeFilter(cur), ...plat },
        [F('row_count') + ' desc'],
        100,
      ),
      this._q(
        [F('cost'), F('cost_all_sources'), F('cost_sa360_duplicate'), F('cost_sa360_only'), F('cost_unmapped_client'), F('cost_assumed_usd'), F('row_count')],
        { [F('report_date')]: rangeFilter(cur), ...plat },
      ),
      this._q(
        [F('platform'), F('account_id'), F('account_name'), F('cost')],
        { [F('report_date')]: rangeFilter(cur), [F('is_unmapped_client')]: 'Yes', [F('include_in_totals')]: 'Yes', ...plat },
        [F('cost') + ' desc'],
        25,
      ),
    ]);
    // heat strip: platform x day
    const days = [];
    for (let d = last60.start; d < today; d = addDays(d, 1)) days.push(ymd(d));
    const byPlat = new Map();
    for (const r of daily) {
      const p = str(r[F('platform')]);
      if (!byPlat.has(p)) byPlat.set(p, new Map());
      byPlat.get(p).set(String(str(r[F('report_date')])).slice(0, 10), num(r[F('row_count')]) || 0);
    }
    const heat = [...byPlat.entries()].map(([p, m]) => {
      const vals = days.map((d) => m.get(d) || 0);
      const nonzero = vals.filter((v) => v > 0).sort((a, b) => a - b);
      const median = nonzero.length ? nonzero[Math.floor(nonzero.length / 2)] : 0;
      return { platform: p, vals, median, gaps: vals.filter((v) => v === 0).length };
    }).sort((a, b) => b.median - a.median);
    const q = quality[0] || {};
    return {
      fresh: fresh.map((r) => ({
        platform: str(r[F('platform')]),
        source: str(r[F('data_source')]),
        last: str(r[F('last_data_date')]),
        lag: num(r[F('days_since_last_data')]),
        accounts: num(r[F('accounts_count')]),
        cost: num(r[F('cost_all_sources')]),
      })),
      heat, days,
      size: size.map((r) => ({
        platform: str(r[F('platform')]),
        rows: num(r[F('row_count')]),
        clients: num(r[F('clients_count')]),
        accounts: num(r[F('accounts_count')]),
        campaigns: num(r[F('campaigns_count')]),
        days: num(r[F('days_with_data')]),
        cost: num(r[F('cost_all_sources')]),
      })),
      quality: Object.fromEntries(Object.entries(q).map(([k, v]) => [k.slice(V.length), num(v)])),
      unmapped: unmapped.map((r) => ({
        platform: str(r[F('platform')]),
        id: str(r[F('account_id')]),
        name: str(r[F('account_name')]),
        cost: num(r[F('cost')]),
      })),
    };
  }

  // ================================================================ render
  render() {
    const p = this.period, c = this.prior;
    return html`
      <div class="pulse">
        <header class="bar">
          <div class="brand">
            ${deptLogo()}
            <div class="brand-txt">
              <span class="eyebrow">Internal · Paid media</span>
              <span class="brand-name">Cross-Client Pulse</span>
            </div>
          </div>
          <nav class="tabs" role="tablist">
            ${TABS.map((t) => html`
              <button role="tab" aria-selected=${this.tab === t.id} class=${this.tab === t.id ? 'on' : ''}
                @click=${() => this._set({ tab: t.id })}>${t.label}</button>`)}
          </nav>
        </header>

        <section class="controls">
          <div class="seg" role="group" aria-label="Date range">
            ${PRESETS.map((x) => html`
              <button class=${this.preset === x.id ? 'on' : ''} @click=${() => this._set({ preset: x.id })}>${x.label}</button>`)}
          </div>
          <div class="seg" role="group" aria-label="Compare to">
            <button class=${this.compare === 'prev' ? 'on' : ''} @click=${() => this._set({ compare: 'prev' })}>vs previous</button>
            <button class=${this.compare === 'yoy' ? 'on' : ''} @click=${() => this._set({ compare: 'yoy' })}>vs last year</button>
          </div>
          <label class="pick">
            <span>Platform</span>
            <select @change=${(e) => this._set({ platform: e.target.value })} .value=${this.platform}>
              <option value="">All platforms</option>
              ${this.platformOptions.map((o) => html`<option value=${o} ?selected=${o === this.platform}>${o}</option>`)}
            </select>
          </label>
          <label class="pick">
            <span>Client</span>
            <select @change=${(e) => this._set({ client: e.target.value })} .value=${this.client}>
              <option value="">All clients</option>
              ${this.clientOptions.map((o) => html`<option value=${o} ?selected=${o === this.client}>${o}</option>`)}
            </select>
          </label>
          <div class="range">
            <b>${human(p.start)} – ${human(addDays(p.end, -1))}</b>
            <span>vs ${humanShort(c.start)} – ${human(addDays(c.end, -1))}</span>
          </div>
        </section>

        ${this.err ? this._errorCard() : nothing}
        <main class="body ${this.busy[this.tab] ? 'is-busy' : ''}">
          ${{
            pulse: () => this._renderPulse(),
            clients: () => this._renderClients(),
            platforms: () => this._renderPlatforms(),
            health: () => this._renderHealth(),
          }[this.tab]()}
        </main>
        <footer class="foot">
          ${asterisk('foot-mark')}
          <span>Spend in USD (unconverted currencies flagged in Data health) · SA360 duplicates of native accounts excluded · data through yesterday</span>
          <span class="kbd">Press <kbd>R</kbd> to refresh</span>
        </footer>
      </div>`;
  }

  _errorCard() {
    const msg = String(this.err?.message || this.err || 'Query failed');
    const notFound = /not found|404/i.test(msg);
    return html`<div class="card err">
      <b>${notFound ? 'The model isn’t deployed yet' : 'Something went wrong loading this view'}</b>
      <p>${notFound
        ? html`Looker can’t find <code>${MODEL}</code> / <code>${EXPLORE}</code>. Deploy the project to production and allow the model on <code>snowflake-dwh</code>.`
        : msg}</p>
      <button class="btn" @click=${() => this._load()}>Try again</button>
    </div>`;
  }

  _skeleton(h = 120) { return html`<div class="sk" style="height:${h}px"></div>`; }

  _deltaChip(d, polarity = 'neutral') {
    if (d == null) return html`<span class="chip muted">n/a</span>`;
    const up = d > 0;
    const good = polarity === 'neutral' ? null : polarity === 'higher' ? up : !up;
    const cls = good == null ? 'neutral' : good ? 'good' : 'bad';
    return html`<span class="chip ${cls}">${up ? '▲' : '▼'} ${Math.abs(d * 100).toFixed(1)}%</span>`;
  }

  _kpiRow(kpi) {
    if (!kpi) return html`<div class="kpis">${[0, 1, 2, 3, 4, 5].map(() => this._skeleton(104))}</div>`;
    const { cur, prev } = kpi;
    const items = [
      { k: 'cost', label: 'Spend', f: fmtMoney, pol: 'neutral', hero: true },
      { k: 'impressions', label: 'Impressions', f: fmtCount, pol: 'higher' },
      { k: 'clicks', label: 'Clicks', f: fmtCount, pol: 'higher' },
      { k: 'cpc', label: 'CPC', f: fmtMoney2, pol: 'lower' },
      { k: 'cpm', label: 'CPM', f: fmtMoney2, pol: 'lower' },
      { k: 'ctr', label: 'CTR', f: (n) => fmtPct(n, 2), pol: 'higher' },
    ];
    return html`<div class="kpis">
      ${items.map((i) => html`
        <div class="kpi ${i.hero ? 'hero-kpi' : ''}">
          <span class="kpi-label">${i.label}</span>
          <span class="kpi-val">${i.f(cur[i.k])}</span>
          <span class="kpi-foot">${this._deltaChip(delta(cur[i.k], prev[i.k]), i.pol)}
            <em>${this.compare === 'yoy' ? 'LY' : 'prev'} ${i.f(prev[i.k])}</em></span>
        </div>`)}
    </div>`;
  }

  _chart(type, rows, opts = {}) {
    return html`<app-chart bare type=${type} .data=${rows} height=${opts.height || '300px'}
      value-format=${opts.format || 'usd'} .options=${chartOptions(opts)}></app-chart>`;
  }

  // ---------------------------------------------------------------- PULSE
  _renderPulse() {
    const d = this.data.pulse;
    const k = d?.kpi;
    const cur = k?.cur || {};
    const dSpend = k ? delta(cur.cost, k.prev.cost) : null;
    const seriesColors = [ORANGE, GREY];
    return html`
      <section class="hero">
        ${asterisk('hero-mark')}
        <span class="eyebrow">${this.client || 'All clients'} · ${this.platform || 'all platforms'}</span>
        <h1>
          ${k ? html`<span class="accent">${fmtMoney(cur.cost)}</span> invested<br/>
            across <span class="u">${fmtInt(cur.clients_count)}</span> clients
            on <span class="u">${fmtInt(cur.platforms_count)}</span> platforms`
            : html`Reading the pulse…`}
        </h1>
        ${k ? html`<p class="lede">
          ${dSpend == null ? '' : html`Spend is <b class=${dSpend >= 0 ? 'up' : 'down'}>${dSpend >= 0 ? 'up' : 'down'} ${Math.abs(dSpend * 100).toFixed(1)}%</b>
          ${this.compare === 'yoy' ? 'on the same period last year' : 'on the previous period'}, `}
          delivered through ${fmtInt(cur.campaigns_count)} active campaigns in ${fmtInt(cur.accounts_count)} ad accounts.
        </p>` : nothing}
      </section>

      ${this._kpiRow(k)}

      <div class="grid g-2-1">
        <div class="card">
          <div class="card-head"><h3>Spend over time</h3>
            <span class="legend"><i style="background:${ORANGE}"></i>This period <i style="background:${GREY}"></i>${this.compare === 'yoy' ? 'Last year' : 'Previous period'}</span></div>
          ${d ? this._chart('areaspline', d.trend.rows, { colors: seriesColors, height: '300px' }) : this._skeleton(300)}
        </div>
        <div class="card">
          <div class="card-head"><h3>Platform mix</h3><span class="sub">share of spend</span></div>
          ${d ? this._platformBars(d.platforms) : this._skeleton(300)}
        </div>
      </div>

      <div class="grid g-1-1">
        <div class="card">
          <div class="card-head"><h3>Growing</h3><span class="sub">largest spend increase</span></div>
          ${d ? this._movers(d.up, 'up') : this._skeleton(220)}
        </div>
        <div class="card">
          <div class="card-head"><h3>Slowing</h3><span class="sub">largest spend decrease</span></div>
          ${d ? this._movers(d.down, 'down') : this._skeleton(220)}
        </div>
      </div>`;
  }

  _platformBars(rows) {
    const total = rows.reduce((s, r) => s + (r.cost || 0), 0) || 1;
    if (!rows.length) return html`<p class="empty">No spend in this period.</p>`;
    return html`<ul class="pbars">
      ${rows.map((r) => {
        const share = (r.cost || 0) / total;
        return html`<li @click=${() => this._set({ platform: this.platform === r.key ? '' : r.key })} title="Filter to ${r.key}">
          <span class="pb-name"><i style="background:${platformColor(r.key)}"></i>${r.key}</span>
          <span class="pb-track"><span class="pb-fill" style="width:${(share * 100).toFixed(2)}%;background:${platformColor(r.key)}"></span></span>
          <span class="pb-val">${fmtMoney(r.cost)}</span>
          <span class="pb-share">${fmtPct(share, 0)}</span>
        </li>`;
      })}
    </ul>`;
  }

  _movers(list, dir) {
    if (!list.length) return html`<p class="empty">Nothing moved meaningfully.</p>`;
    const max = Math.max(...list.map((m) => Math.abs(m.abs))) || 1;
    return html`<ol class="movers ${dir}">
      ${list.map((m, i) => html`<li @click=${() => this._set({ client: m.key, tab: 'clients' })} title="Open ${m.key}">
        <span class="rank">${String(i + 1).padStart(2, '0')}</span>
        <span class="m-name">${m.key}</span>
        <span class="m-bar"><span style="width:${(Math.abs(m.abs) / max * 100).toFixed(1)}%"></span></span>
        <span class="m-abs">${m.abs >= 0 ? '+' : '−'}${fmtMoney(Math.abs(m.abs))}</span>
        <span class="m-rel">${m.prev ? (m.abs >= 0 ? '+' : '') + ((m.cost / m.prev - 1) * 100).toFixed(0) + '%' : 'new'}</span>
      </li>`)}
    </ol>`;
  }

  // ---------------------------------------------------------------- CLIENTS
  _renderClients() {
    const d = this.data.clients;
    const colors = d ? d.mixPlatforms.map(platformColor) : [];
    return html`
      <section class="hero slim">
        ${asterisk('hero-mark')}
        <span class="eyebrow">Portfolio</span>
        <h1>${d ? html`<span class="accent">${fmtInt(d.n80)}</span> clients drive 80% of spend` : 'Mapping the portfolio…'}</h1>
      </section>
      <div class="stats">
        ${this._stat('Active clients', d ? fmtInt(d.rows.length) : null)}
        ${this._stat('Top-10 share of spend', d ? fmtPct(d.top10Share, 0) : null, true)}
        ${this._stat('Median client spend', d ? fmtMoney(d.median) : null)}
        ${this._stat('Total spend', d ? fmtMoney(d.total) : null)}
      </div>
      <div class="card">
        <div class="card-head"><h3>Platform mix · top 12 clients</h3><span class="sub">share of each client’s spend</span></div>
        ${d ? this._chart('bar', d.mix, { colors, height: '380px', stacking: 'percent', legend: true, format: 'usd' }) : this._skeleton(380)}
      </div>
      <div class="card">
        <div class="card-head"><h3>Client leaderboard</h3><span class="sub">click a column to sort · click a row to focus the app on that client</span></div>
        ${d ? this._clientTable(d) : this._skeleton(420)}
      </div>`;
  }

  _stat(label, value, accent = false) {
    return html`<div class="stat ${accent ? 'accent-stat' : ''}">
      <span class="kpi-label">${label}</span>
      ${value == null ? this._skeleton(40) : html`<span class="stat-val">${value}</span>`}
    </div>`;
  }

  _clientTable(d) {
    const key = this.sortKey;
    const rows = [...d.rows].map((r) => ({ ...r, share: d.total ? (r.cost || 0) / d.total : 0, chg: delta(r.cost, r.prev) }));
    rows.sort((a, b) => (b[key] ?? -Infinity) - (a[key] ?? -Infinity));
    const max = Math.max(...rows.map((r) => r.cost || 0)) || 1;
    const th = (k, label, cls = 'n') => html`<th class="${cls} ${key === k ? 'sorted' : ''}" @click=${() => (this.sortKey = k)}>${label}</th>`;
    return html`<div class="tbl-wrap"><table class="tbl">
      <thead><tr>
        <th class="t">#</th><th class="t">Client</th>
        ${th('cost', 'Spend')}${th('chg', 'Δ')}${th('share', 'Share')}
        ${th('platforms_count', 'Platforms')}${th('accounts_count', 'Accounts')}
        ${th('clicks', 'Clicks')}${th('cpc', 'CPC')}${th('ctr', 'CTR')}
      </tr></thead>
      <tbody>
        ${rows.slice(0, 100).map((r, i) => html`<tr class=${this.client === r.key ? 'sel' : ''}
            @click=${() => this._set({ client: this.client === r.key ? '' : r.key })}>
          <td class="t rank">${i + 1}</td>
          <td class="t name">${r.key}</td>
          <td class="n bar-cell"><span class="cell-bar" style="width:${((r.cost || 0) / max * 100).toFixed(1)}%"></span><b>${fmtMoney(r.cost)}</b></td>
          <td class="n">${r.chg == null ? html`<span class="muted">new</span>` : html`<span class=${r.chg >= 0 ? 'pos' : 'neg'}>${r.chg >= 0 ? '+' : ''}${(r.chg * 100).toFixed(0)}%</span>`}</td>
          <td class="n">${fmtPct(r.share, 1)}</td>
          <td class="n">${fmtInt(r.platforms_count)}</td>
          <td class="n">${fmtInt(r.accounts_count)}</td>
          <td class="n">${fmtCount(r.clicks)}</td>
          <td class="n">${fmtMoney2(r.cpc)}</td>
          <td class="n">${fmtPct(r.ctr, 2)}</td>
        </tr>`)}
      </tbody>
    </table></div>`;
  }

  // ---------------------------------------------------------------- PLATFORMS
  _renderPlatforms() {
    const d = this.data.platforms;
    const colors = d ? d.platNames.map(platformColor) : [];
    const isD = (a, b) => (a == null || b == null ? null : a - b);
    return html`
      ${this._kpiRow(d?.kpi)}
      <div class="pcards">
        ${d ? d.plats.map((p) => this._platformCard(p, d.plats)) : [0, 1, 2, 3].map(() => this._skeleton(170))}
      </div>
      <div class="grid g-2-1">
        <div class="card">
          <div class="card-head"><h3>Spend by platform over time</h3></div>
          ${d ? this._chart('column', d.stack, { colors, height: '320px', stacking: 'normal', legend: true }) : this._skeleton(320)}
        </div>
        <div class="card">
          <div class="card-head"><h3>Channel split</h3></div>
          ${d ? this._chart('donut', d.channels.map((c) => ({ 'c.channel': c.key, 'c.spend': c.cost })),
              { colors: [INK, ORANGE, '#7B5BE3', '#2FB5BA', '#E7A33E', GREY], height: '320px', legend: true }) : this._skeleton(320)}
        </div>
      </div>
      <div class="grid g-1-2">
        <div class="card is-card">
          <div class="card-head"><h3>Search impression share</h3><span class="sub">Google & Bing</span></div>
          ${d ? html`
            <div class="is-big"><span class="accent">${fmtPct(d.is.is, 1)}</span>
              ${(() => { const x = isD(d.is.is, d.isPrev.is); return x == null ? '' : html`<span class="chip ${x >= 0 ? 'good' : 'bad'}">${x >= 0 ? '▲' : '▼'} ${Math.abs(x * 100).toFixed(1)} pts</span>`; })()}</div>
            <div class="is-split">
              <div><span class="dot" style="background:${INK}"></span>Captured<b>${fmtPct(d.is.is)}</b></div>
              <div><span class="dot" style="background:${ORANGE}"></span>Lost to budget<b>${fmtPct(d.is.budget)}</b></div>
              <div><span class="dot" style="background:${GREY}"></span>Lost to rank<b>${fmtPct(d.is.rank)}</b></div>
            </div>
            <div class="is-strip">
              <span style="flex:${d.is.is || 0};background:${INK}"></span>
              <span style="flex:${d.is.budget || 0};background:${ORANGE}"></span>
              <span style="flex:${d.is.rank || 0};background:${GREY}"></span>
            </div>
            <p class="note">Budget loss is money left on the table; rank loss is a bid/quality problem.</p>`
          : this._skeleton(220)}
        </div>
        <div class="card">
          <div class="card-head"><h3>Where search demand is missed</h3><span class="sub">top 10 search spenders</span></div>
          ${d ? this._chart('bar', d.isByClient, { colors: [INK, ORANGE, GREY], height: '300px', stacking: 'normal', legend: true, format: 'percent1', max: 1 }) : this._skeleton(300)}
        </div>
      </div>`;
  }

  _platformCard(p, all) {
    const total = all.reduce((s, r) => s + (r.cost || 0), 0) || 1;
    const chg = delta(p.cost, p.prev);
    const on = this.platform === p.key;
    return html`<button class="pcard ${on ? 'on' : ''}" style="--pc:${platformColor(p.key)}"
        @click=${() => this._set({ platform: on ? '' : p.key })}>
      <span class="pc-top"><b>${p.key}</b>${this._deltaChip(chg)}</span>
      <span class="pc-val">${fmtMoney(p.cost)}</span>
      <span class="pc-share"><span style="width:${((p.cost || 0) / total * 100).toFixed(1)}%"></span></span>
      <span class="pc-meta">
        <span>CPC <b>${fmtMoney2(p.cpc)}</b></span>
        <span>CPM <b>${fmtMoney2(p.cpm)}</b></span>
        <span>CTR <b>${fmtPct(p.ctr, 2)}</b></span>
      </span>
      <span class="pc-meta dim"><span>${fmtInt(p.clients_count)} clients</span><span>${fmtInt(p.accounts_count)} accounts</span></span>
    </button>`;
  }

  // ---------------------------------------------------------------- DATA HEALTH
  _renderHealth() {
    const d = this.data.health;
    const q = d?.quality || {};
    const share = (x) => (q.cost ? (x || 0) / q.cost : null);
    const stale = d ? d.fresh.filter((f) => f.lag != null && f.lag > 2 && f.source !== 'SA360 (duplicate of native)') : [];
    return html`
      <section class="hero slim">
        ${asterisk('hero-mark')}
        <span class="eyebrow">Data flow</span>
        <h1>${d ? (stale.length
          ? html`<span class="accent">${stale.length}</span> feed${stale.length > 1 ? 's are' : ' is'} running late`
          : html`All feeds are <span class="accent">fresh</span>`) : 'Checking the pipes…'}</h1>
        ${d ? html`<p class="lede">${fmtInt(q.row_count)} rows in the selected period · ${fmtInt(d.size.length)} publishers reporting.</p>` : nothing}
      </section>

      <div class="stats">
        ${this._stat('Unmapped-client spend', d ? fmtMoney(q.cost_unmapped_client) : null, (q.cost_unmapped_client || 0) > 0)}
        ${this._stat('Unverified-currency spend', d ? html`${fmtMoney(q.cost_assumed_usd)} <small>${fmtPct(share(q.cost_assumed_usd), 0)} of total</small>` : null)}
        ${this._stat('SA360 duplicates excluded', d ? fmtMoney(q.cost_sa360_duplicate) : null)}
        ${this._stat('SA360-only spend counted', d ? fmtMoney(q.cost_sa360_only) : null)}
      </div>

      <div class="card">
        <div class="card-head"><h3>Feed heartbeat · last 60 days</h3><span class="sub">rows landed per platform per day · white gaps = no data</span></div>
        ${d ? this._heat(d) : this._skeleton(260)}
      </div>

      <div class="grid g-1-1">
        <div class="card">
          <div class="card-head"><h3>Freshness</h3><span class="sub">latest date with data</span></div>
          ${d ? this._freshTable(d.fresh) : this._skeleton(260)}
        </div>
        <div class="card">
          <div class="card-head"><h3>Dataset size per publisher</h3><span class="sub">selected period · all sources</span></div>
          ${d ? this._sizeTable(d.size) : this._skeleton(260)}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Accounts spending without a client mapping</h3><span class="sub">fix in BarCloud / client roster</span></div>
        ${d ? (d.unmapped.length ? html`<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th class="t">Platform</th><th class="t">Account</th><th class="t">ID</th><th class="n">Spend</th></tr></thead>
            <tbody>${d.unmapped.map((u) => html`<tr><td class="t"><i class="sw" style="background:${platformColor(u.platform)}"></i>${u.platform}</td>
              <td class="t name">${u.name}</td><td class="t mono">${u.id}</td><td class="n"><b>${fmtMoney(u.cost)}</b></td></tr>`)}</tbody>
          </table></div>` : html`<p class="empty ok">Every spending account maps to a client. ✓</p>`)
          : this._skeleton(160)}
      </div>`;
  }

  _heat(d) {
    const max = Math.max(1, ...d.heat.map((h) => Math.max(...h.vals)));
    const ticks = d.days.map((x, i) => (i % 7 === 0 ? humanShort(new Date(x + 'T00:00:00')) : ''));
    return html`<div class="heat" style="--n:${d.days.length}">
      ${d.heat.map((h) => html`
        <span class="h-name"><i style="background:${platformColor(h.platform)}"></i>${h.platform}
          ${h.gaps ? html`<em>${h.gaps} gap${h.gaps > 1 ? 's' : ''}</em>` : nothing}</span>
        <span class="h-row">${h.vals.map((v, i) => {
          const rel = h.median ? v / h.median : 0;
          const a = v === 0 ? 0 : Math.max(0.15, Math.min(1, Math.sqrt(v / max)));
          const warn = v > 0 && h.median && rel < 0.5;
          return html`<span class="h-cell ${v === 0 ? 'zero' : ''} ${warn ? 'warn' : ''}"
            style="--a:${a.toFixed(3)}" title="${h.platform} · ${d.days[i]} · ${fmtInt(v)} rows"></span>`;
        })}</span>`)}
      <span></span><span class="h-axis">${ticks.map((t) => html`<span>${t}</span>`)}</span>
    </div>`;
  }

  _freshTable(rows) {
    const badge = (lag) => lag == null ? 'muted' : lag <= 1 ? 'good' : lag <= 3 ? 'warn' : 'bad';
    return html`<div class="tbl-wrap"><table class="tbl compact">
      <thead><tr><th class="t">Platform</th><th class="t">Source</th><th class="t">Latest</th><th class="n">Lag</th><th class="n">Accounts</th></tr></thead>
      <tbody>${rows.map((r) => html`<tr>
        <td class="t"><i class="sw" style="background:${platformColor(r.platform)}"></i>${r.platform}</td>
        <td class="t muted">${r.source}</td>
        <td class="t mono">${r.last}</td>
        <td class="n"><span class="badge ${badge(r.lag)}">${r.lag == null ? '—' : r.lag <= 1 ? 'on time' : r.lag + 'd'}</span></td>
        <td class="n">${fmtInt(r.accounts)}</td>
      </tr>`)}</tbody>
    </table></div>`;
  }

  _sizeTable(rows) {
    const max = Math.max(1, ...rows.map((r) => r.rows || 0));
    return html`<div class="tbl-wrap"><table class="tbl compact">
      <thead><tr><th class="t">Platform</th><th class="n">Rows</th><th class="n">Clients</th><th class="n">Accounts</th><th class="n">Campaigns</th><th class="n">Days</th></tr></thead>
      <tbody>${rows.map((r) => html`<tr>
        <td class="t"><i class="sw" style="background:${platformColor(r.platform)}"></i>${r.platform}</td>
        <td class="n bar-cell"><span class="cell-bar ink" style="width:${((r.rows || 0) / max * 100).toFixed(1)}%"></span><b>${fmtCount(r.rows)}</b></td>
        <td class="n">${fmtInt(r.clients)}</td>
        <td class="n">${fmtInt(r.accounts)}</td>
        <td class="n">${fmtCount(r.campaigns)}</td>
        <td class="n">${fmtInt(r.days)}</td>
      </tr>`)}</tbody>
    </table></div>`;
  }
}

// ---------------------------------------------------------------- Highcharts options
function chartOptions(o) {
  const font = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const opts = {
    colors: o.colors,
    chart: { backgroundColor: 'transparent', style: { fontFamily: font }, spacing: [8, 4, 4, 4] },
    title: { text: null },
    credits: { enabled: false },
    legend: o.legend
      ? { enabled: true, align: 'left', verticalAlign: 'top', itemStyle: { fontWeight: '600', color: '#444', fontSize: '12px' }, symbolRadius: 3 }
      : { enabled: false },
    xAxis: { lineColor: '#DAD7D2', tickColor: 'transparent', labels: { style: { color: '#8A857F', fontSize: '11px' } } },
    yAxis: { gridLineColor: '#ECEAE6', title: { text: null }, labels: { style: { color: '#8A857F', fontSize: '11px' } }, ...(o.max ? { max: o.max } : {}) },
    tooltip: { backgroundColor: '#111', borderWidth: 0, borderRadius: 10, shadow: false, style: { color: '#fff', fontSize: '12px' }, shared: true },
    plotOptions: {
      series: { animation: { duration: 500 }, ...(o.stacking ? { stacking: o.stacking } : {}) },
      areaspline: { fillOpacity: 0.12, lineWidth: 2.5, marker: { enabled: false } },
      column: { borderWidth: 0, borderRadius: 3, pointPadding: 0.06, groupPadding: 0.08 },
      bar: { borderWidth: 0, borderRadius: 3, pointPadding: 0.08, groupPadding: 0.06 },
      pie: { borderWidth: 2, borderColor: '#fff', innerSize: '62%', dataLabels: { enabled: false }, showInLegend: true },
    },
  };
  return opts;
}

// ---------------------------------------------------------------- styles
const STYLES_CSS = `
  :root, .pulse {
    --bg: #ECEBE8; --card: #FBFBFA; --line: #DEDBD6; --ink: #111; --muted: #77726C;
    --orange: ${ORANGE}; --good: #1C8C5E; --bad: #D2452A; --warn: #E7A33E;
    --app-primary: ${ORANGE}; --app-chart-1: ${ORANGE};
  }
  body { margin: 0; background: var(--bg); }
  .pulse { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--ink); background: var(--bg); min-height: 100vh; padding: 0 32px 24px; box-sizing: border-box;
    -webkit-font-smoothing: antialiased; font-variant-numeric: tabular-nums; }
  .pulse * { box-sizing: border-box; }
  .pulse button { font: inherit; cursor: pointer; }

  /* header */
  .bar { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 22px 0 18px;
    position: sticky; top: 0; z-index: 5; background: linear-gradient(var(--bg) 80%, rgba(236,235,232,0)); }
  .brand { display: flex; align-items: center; gap: 14px; }
  .logo { height: 46px; width: auto; fill: var(--ink); }
  .brand-txt { display: flex; flex-direction: column; line-height: 1.1; border-left: 1px solid var(--line); padding-left: 14px; }
  .eyebrow { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
  .brand-name { font-weight: 800; font-size: 17px; letter-spacing: -.01em; }
  .tabs { display: flex; gap: 4px; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 4px; }
  .tabs button { border: 0; background: transparent; padding: 9px 18px; border-radius: 999px; font-weight: 600; font-size: 13px; color: #55504A; transition: background .15s, color .15s; }
  .tabs button:hover { color: var(--ink); }
  .tabs button.on { background: var(--ink); color: #fff; }

  /* controls */
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 4px 0 6px; }
  .seg { display: inline-flex; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 3px; }
  .seg button { border: 0; background: transparent; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; color: #55504A; }
  .seg button.on { background: var(--orange); color: #fff; }
  .pick { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 3px 6px 3px 14px; font-size: 12px; }
  .pick span { color: var(--muted); font-weight: 600; }
  .pick select { border: 0; background: transparent; font: inherit; font-weight: 600; padding: 4px 6px; max-width: 220px; outline: none; }
  .range { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; font-size: 12px; line-height: 1.3; }
  .range span { color: var(--muted); }

  /* hero */
  .hero { position: relative; overflow: hidden; padding: 38px 0 26px; }
  .hero.slim { padding: 30px 0 18px; }
  .hero h1 { margin: 10px 0 0; font-family: "Arial Black", "Helvetica Neue", Inter, Arial, sans-serif; font-weight: 900;
    font-size: clamp(30px, 4.4vw, 64px); line-height: .98; letter-spacing: -.035em; text-transform: uppercase; max-width: 18ch; position: relative; z-index: 1; }
  .hero.slim h1 { font-size: clamp(26px, 3.4vw, 48px); max-width: 22ch; }
  .hero .accent, .accent { color: var(--orange); }
  .hero .u { text-decoration: underline; text-decoration-thickness: .08em; text-underline-offset: .1em; }
  .lede { position: relative; z-index: 1; max-width: 62ch; font-size: 16px; line-height: 1.5; color: #3A3632; margin: 16px 0 0; }
  .lede b.up { color: var(--ink); } .lede b.down { color: var(--bad); }
  .hero-mark { position: absolute; right: -40px; top: -60px; height: 360px; width: auto; fill: var(--ink); opacity: .045; pointer-events: none; }

  /* KPI row */
  .kpis { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin: 6px 0 16px; }
  .kpi, .stat { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; min-height: 104px; }
  .hero-kpi { background: var(--ink); color: #fff; border-color: var(--ink); }
  .hero-kpi .kpi-label, .hero-kpi em { color: #BDB8B2; }
  .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: var(--muted); font-weight: 700; }
  .kpi-val { font-size: 30px; font-weight: 800; letter-spacing: -.02em; line-height: 1; }
  .hero-kpi .kpi-val { color: var(--orange); }
  .kpi-foot { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-top: auto; }
  .kpi-foot em { font-style: normal; color: var(--muted); }
  .chip { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: #EFEDEA; color: #3A3632; white-space: nowrap; }
  .hero-kpi .chip { background: #2A2A2A; color: #fff; }
  .chip.good { background: #E3F3EB; color: var(--good); }
  .chip.bad { background: #FBE6E1; color: var(--bad); }
  .chip.muted { color: var(--muted); }

  .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 4px 0 16px; }
  .stat-val { font-size: 34px; font-weight: 800; letter-spacing: -.02em; }
  .stat-val small { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: 0; margin-left: 6px; }
  .accent-stat { border-color: var(--orange); box-shadow: inset 0 0 0 1px var(--orange); }
  .accent-stat .stat-val { color: var(--orange); }

  /* cards & grids */
  .grid { display: grid; gap: 16px; margin-bottom: 16px; }
  .g-2-1 { grid-template-columns: 2fr 1fr; } .g-1-1 { grid-template-columns: 1fr 1fr; } .g-1-2 { grid-template-columns: 1fr 2fr; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: 20px 22px; margin-bottom: 16px; position: relative; }
  .grid > .card { margin-bottom: 0; }
  .card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .card-head h3 { margin: 0; font-size: 15px; font-weight: 800; letter-spacing: -.01em; }
  .sub { font-size: 12px; color: var(--muted); }
  .legend { font-size: 12px; color: var(--muted); display: inline-flex; align-items: center; gap: 6px; }
  .legend i { width: 14px; height: 3px; border-radius: 2px; display: inline-block; margin-left: 8px; }
  .empty { color: var(--muted); font-size: 13px; padding: 20px 0; } .empty.ok { color: var(--good); font-weight: 600; }
  .note { font-size: 12px; color: var(--muted); margin: 14px 0 0; }

  /* platform bars */
  .pbars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .pbars li { display: grid; grid-template-columns: 110px 1fr 64px 38px; align-items: center; gap: 10px; font-size: 13px; cursor: pointer; padding: 2px 0; }
  .pbars li:hover .pb-name { color: var(--orange); }
  .pb-name { display: flex; align-items: center; gap: 8px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pb-name i, .h-name i, .sw { width: 9px; height: 9px; border-radius: 3px; display: inline-block; flex: none; margin-right: 6px; vertical-align: 0; }
  .pb-track { height: 10px; background: #EFEDEA; border-radius: 6px; overflow: hidden; }
  .pb-fill { display: block; height: 100%; border-radius: 6px; }
  .pb-val { text-align: right; font-weight: 700; } .pb-share { text-align: right; color: var(--muted); font-size: 12px; }

  /* movers */
  .movers { list-style: none; margin: 0; padding: 0; }
  .movers li { display: grid; grid-template-columns: 28px minmax(0, 1.4fr) 1fr 72px 52px; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid #EEECE8; font-size: 13px; cursor: pointer; }
  .movers li:first-child { border-top: 0; }
  .movers li:hover .m-name { color: var(--orange); }
  .rank { color: var(--muted); font-weight: 700; font-size: 11px; }
  .m-name { font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .m-bar { height: 6px; background: #EFEDEA; border-radius: 4px; overflow: hidden; }
  .m-bar span { display: block; height: 100%; border-radius: 4px; background: var(--ink); }
  .movers.up li:first-child .m-bar span { background: var(--orange); }
  .movers.down .m-bar span { background: #B9B4AE; }
  .m-abs { text-align: right; font-weight: 800; } .m-rel { text-align: right; font-size: 12px; color: var(--muted); }

  /* platform cards */
  .pcards { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .pcard { text-align: left; background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 8px; position: relative; overflow: hidden; transition: transform .15s, box-shadow .15s; }
  .pcard::before { content: ''; position: absolute; left: 0; top: 0; right: 0; height: 4px; background: var(--pc); }
  .pcard:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.06); }
  .pcard.on { border-color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
  .pc-top { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
  .pc-val { font-size: 26px; font-weight: 800; letter-spacing: -.02em; }
  .pc-share { height: 4px; background: #EFEDEA; border-radius: 3px; overflow: hidden; }
  .pc-share span { display: block; height: 100%; background: var(--pc); }
  .pc-meta { display: flex; gap: 12px; font-size: 11px; color: var(--muted); flex-wrap: wrap; }
  .pc-meta b { color: var(--ink); font-weight: 700; }
  .pc-meta.dim { font-size: 11px; }

  /* impression share */
  .is-big { display: flex; align-items: center; gap: 12px; font-size: 56px; font-weight: 900; letter-spacing: -.03em; line-height: 1; margin: 6px 0 16px; }
  .is-split { display: grid; gap: 8px; font-size: 13px; }
  .is-split div { display: flex; align-items: center; gap: 8px; }
  .is-split b { margin-left: auto; }
  .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .is-strip { display: flex; height: 12px; border-radius: 8px; overflow: hidden; margin-top: 14px; background: #EFEDEA; }

  /* tables */
  .tbl-wrap { overflow: auto; max-height: 560px; border-radius: 12px; }
  .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
  .tbl th { position: sticky; top: 0; background: var(--card); font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); font-weight: 700; padding: 10px; border-bottom: 1px solid var(--line); cursor: pointer; white-space: nowrap; z-index: 1; }
  .tbl th.sorted { color: var(--orange); }
  .tbl td { padding: 11px 10px; border-bottom: 1px solid #EEECE8; white-space: nowrap; }
  .tbl.compact td { padding: 8px 10px; }
  .tbl tbody tr { cursor: pointer; transition: background .12s; }
  .tbl tbody tr:hover { background: #F3F1EE; }
  .tbl tr.sel { background: #FFF0E9; }
  .t { text-align: left; } .n { text-align: right; }
  .name { font-weight: 700; max-width: 280px; overflow: hidden; text-overflow: ellipsis; }
  .mono { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px; color: #55504A; }
  .muted { color: var(--muted); }
  .pos { color: var(--ink); font-weight: 700; } .neg { color: var(--bad); font-weight: 700; }
  .bar-cell { position: relative; min-width: 140px; }
  .cell-bar { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); height: 22px; background: #FFE3D8; border-radius: 5px; z-index: 0; max-width: calc(100% - 20px); }
  .cell-bar.ink { background: #E7E4DF; }
  .bar-cell b { position: relative; z-index: 1; padding-right: 6px; }
  .badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
  .badge.good { background: #E3F3EB; color: var(--good); } .badge.warn { background: #FCF0D9; color: #9A6400; }
  .badge.bad { background: #FBE6E1; color: var(--bad); } .badge.muted { background: #EFEDEA; color: var(--muted); }

  /* heatmap */
  .heat { display: grid; grid-template-columns: 170px 1fr; row-gap: 6px; column-gap: 12px; align-items: center; }
  .h-name { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 2px; white-space: nowrap; }
  .h-name em { font-style: normal; font-weight: 700; font-size: 10px; color: var(--bad); background: #FBE6E1; border-radius: 999px; padding: 1px 6px; margin-left: 6px; }
  .h-row { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 2px; }
  .h-cell { height: 16px; border-radius: 3px; background: rgba(17,17,17,var(--a)); }
  .h-cell.zero { background: #fff; box-shadow: inset 0 0 0 1px #E6E3DE; }
  .h-cell.warn { background: var(--orange); opacity: .85; }
  .h-axis { display: grid; grid-template-columns: repeat(var(--n), 1fr); font-size: 10px; color: var(--muted); }
  .h-axis span { white-space: nowrap; overflow: visible; }

  /* states */
  .sk { border-radius: 14px; background: linear-gradient(90deg, #E9E7E3 0%, #F3F2EF 50%, #E9E7E3 100%); background-size: 200% 100%; animation: sk 1.3s ease-in-out infinite; }
  @keyframes sk { to { background-position: -200% 0; } }
  .is-busy { opacity: .72; transition: opacity .2s; }
  .err { border-color: var(--bad); }
  .err b { color: var(--bad); } .err p { color: #3A3632; }
  .btn { border: 0; background: var(--ink); color: #fff; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 12px; }
  code { background: #EFEDEA; padding: 1px 6px; border-radius: 5px; font-size: 12px; }

  /* footer */
  .foot { display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--muted); padding: 18px 0 6px; border-top: 1px solid var(--line); margin-top: 8px; }
  .foot-mark { height: 16px; width: auto; fill: var(--orange); }
  .kbd { margin-left: auto; } kbd { background: #fff; border: 1px solid var(--line); border-radius: 4px; padding: 0 5px; font-size: 10px; }

  @media (max-width: 1100px) {
    .kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .g-2-1, .g-1-1, .g-1-2 { grid-template-columns: 1fr; }
    .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .pulse { padding: 0 16px 16px; }
    .bar { flex-direction: column; align-items: flex-start; }
    .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .heat { grid-template-columns: 110px 1fr; }
    .range { margin-left: 0; align-items: flex-start; }
  }
`;

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById('dept-pulse-css')) return;
  const el = document.createElement('style');
  el.id = 'dept-pulse-css';
  el.textContent = STYLES_CSS;
  document.head.appendChild(el);
}

const elementName = 'dept-cross-client-pulse';
if (!customElements.get(elementName)) {
  customElements.define(elementName, DeptCrossClientPulse);
}
export default DeptCrossClientPulse;
