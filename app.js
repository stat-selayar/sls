/**
 * SLS Finder - Kabupaten Kepulauan Selayar
 * Client-Side WebGIS Application for SLS Detection & Lookup
 */

// Global State
const state = {
  map: null,
  geojsonData: null,
  geojsonLayer: null,
  highlightLayer: null,
  gpsMarker: null,
  gpsCircle: null,
  clickMarker: null,
  selectedFeature: null,
  selectedCenterLatLng: null,
  isDrawerMinimized: false,
  activeBasemap: 'google-satellite',
  basemapLayers: {},
  featuresWithBbox: [],
  kecamatanList: [],
  desaList: [],
  selayarBounds: null,
  isGeojsonLoaded: false,
  // Excel multi-points state
  excelPoints: [],
  excelPointsLayer: null,
  excelRawData: [],
  excelHeaders: [],
  excelFileName: '',
  isExcelLayerVisible: true,
  // Cek Mitra mode
  mitraMode: false,
  prevBasemap: null,
  mitraList: [],
  mitraDesaCounts: new Map(),
  mitraSource: '',
  currentMitraRows: [],
  mitraBannerCollapsed: false,
  // Sample SLS upload
  sampel: null, // { fileName, entries, matched, failed }
  sampelLayer: null
};

// Optional published CSV (a sanitized sheet tab). Leave empty to let users load
// the partner file in their own browser instead; see README.
const MITRA_DATA_URL = '';

// UI Elements
const DOM = {
  map: document.getElementById('map'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingText: document.getElementById('loadingText'),
  toastContainer: document.getElementById('toastContainer'),
  // Controls
  btnHome: document.getElementById('btnHome'),
  btnBasemap: document.getElementById('btnBasemap'),
  btnGps: document.getElementById('btnGps'),
  gpsIcon: document.getElementById('gpsIcon'),
  // Search
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  searchSuggestions: document.getElementById('searchSuggestions'),
  // Drawer
  bottomSheet: document.getElementById('bottomSheet'),
  btnCloseDrawer: document.getElementById('btnCloseDrawer'),
  sidePanel: document.getElementById('sidePanel'),
  panelScroll: document.getElementById('panelScroll'),
  panelEmpty: document.getElementById('panelEmpty'),
  panelToggleLabel: document.getElementById('panelToggleLabel'),
  btnPanelHandle: document.getElementById('btnPanelHandle'),
  drawerHeader: document.getElementById('drawerHeader'),
  btnToggleDrawer: document.getElementById('btnToggleDrawer'),
  btnMaximizeDrawer: document.getElementById('btnMaximizeDrawer'),
  drawerToggleIcon: document.getElementById('drawerToggleIcon'),
  drawerBody: document.getElementById('drawerBody'),
  btnReopenDrawer: document.getElementById('btnReopenDrawer'),
  reopenSlsName: document.getElementById('reopenSlsName'),
  slsName: document.getElementById('slsName'),
  slsDesaKec: document.getElementById('slsDesaKec'),
  slsId: document.getElementById('slsId'),
  slsLuas: document.getElementById('slsLuas'),
  slsCoord: document.getElementById('slsCoord'),
  badgeStatus: document.getElementById('badgeStatus'),
  badgeGpsAccuracy: document.getElementById('badgeGpsAccuracy'),
  btnCopyId: document.getElementById('btnCopyId'),
  btnCopyCoord: document.getElementById('btnCopyCoord'),
  btnGoogleMaps: document.getElementById('btnGoogleMaps'),
  btnShareInfo: document.getElementById('btnShareInfo'),
  // Basemap Modal
  modalBasemap: document.getElementById('modalBasemap'),
  btnCloseBasemapModal: document.getElementById('btnCloseBasemapModal'),
  basemapOptions: document.getElementById('basemapOptions'),
  // Coord Modal
  btnOpenCoordModal: document.getElementById('btnOpenCoordModal'),
  modalCoord: document.getElementById('modalCoord'),
  btnCloseCoordModal: document.getElementById('btnCloseCoordModal'),
  inputCoordQuick: document.getElementById('inputCoordQuick'),
  inputLat: document.getElementById('inputLat'),
  inputLng: document.getElementById('inputLng'),
  btnSubmitCoord: document.getElementById('btnSubmitCoord'),
  // Filter Modal
  btnOpenFilterModal: document.getElementById('btnOpenFilterModal'),
  modalFilter: document.getElementById('modalFilter'),
  btnCloseFilterModal: document.getElementById('btnCloseFilterModal'),
  filterKecamatan: document.getElementById('filterKecamatan'),
  filterDesa: document.getElementById('filterDesa'),
  filterSls: document.getElementById('filterSls'),
  btnApplyFilter: document.getElementById('btnApplyFilter'),
  // Excel Modal & Controls
  btnOpenExcelModal: document.getElementById('btnOpenExcelModal'),
  modalExcel: document.getElementById('modalExcel'),
  btnCloseExcelModal: document.getElementById('btnCloseExcelModal'),
  excelUploadSection: document.getElementById('excelUploadSection'),
  excelDropzone: document.getElementById('excelDropzone'),
  excelFileInput: document.getElementById('excelFileInput'),
  btnDownloadExcelTemplate: document.getElementById('btnDownloadExcelTemplate'),
  excelMappingSection: document.getElementById('excelMappingSection'),
  excelFileMeta: document.getElementById('excelFileMeta'),
  selectLatCol: document.getElementById('selectLatCol'),
  selectLngCol: document.getElementById('selectLngCol'),
  selectLabelCol: document.getElementById('selectLabelCol'),
  btnProcessExcelData: document.getElementById('btnProcessExcelData'),
  excelResultSection: document.getElementById('excelResultSection'),
  statTotalPoints: document.getElementById('statTotalPoints'),
  statInPoints: document.getElementById('statInPoints'),
  statOutPoints: document.getElementById('statOutPoints'),
  tabCountAll: document.getElementById('tabCountAll'),
  tabCountIn: document.getElementById('tabCountIn'),
  tabCountOut: document.getElementById('tabCountOut'),
  excelTableBody: document.getElementById('excelTableBody'),
  btnResetExcel: document.getElementById('btnResetExcel'),
  btnExportExcelResult: document.getElementById('btnExportExcelResult'),
  btnViewExcelOnMap: document.getElementById('btnViewExcelOnMap'),
  // Floating Excel Widget
  excelPointsWidget: document.getElementById('excelPointsWidget'),
  excelWidgetTitle: document.getElementById('excelWidgetTitle'),
  excelWidgetInCount: document.getElementById('excelWidgetInCount'),
  excelWidgetOutCount: document.getElementById('excelWidgetOutCount'),
  btnToggleExcelVisibility: document.getElementById('btnToggleExcelVisibility'),
  excelEyeIcon: document.getElementById('excelEyeIcon'),
  btnClearExcelPoints: document.getElementById('btnClearExcelPoints'),
  btnReopenExcelModal: document.getElementById('btnReopenExcelModal'),
  // Cek Mitra
  btnToggleMitra: document.getElementById('btnToggleMitra'),
  btnToggleMitraLabel: document.getElementById('btnToggleMitraLabel'),
  mitraBanner: document.getElementById('mitraBanner'),
  mitraBannerText: document.getElementById('mitraBannerText'),
  btnTheme: document.getElementById('btnTheme'),
  panelResizer: document.getElementById('panelResizer'),
  mitraLegend: document.getElementById('mitraLegend'),
  btnLoadMitra: document.getElementById('btnLoadMitra'),
  btnToggleMitraBanner: document.getElementById('btnToggleMitraBanner'),
  btnMinimizeSampel: document.getElementById('btnMinimizeSampel'),
  btnZoomIn: document.getElementById('btnZoomIn'),
  btnZoomOut: document.getElementById('btnZoomOut'),
  btnLoadMitraLabel: document.getElementById('btnLoadMitraLabel'),
  mitraFileInput: document.getElementById('mitraFileInput'),
  mitraDataMeta: document.getElementById('mitraDataMeta'),
  mitraSection: document.getElementById('mitraSection'),
  mitraSummary: document.getElementById('mitraSummary'),
  mitraSubSummary: document.getElementById('mitraSubSummary'),
  mitraSearch: document.getElementById('mitraSearch'),
  mitraList: document.getElementById('mitraList'),
  btnCopyMitra: document.getElementById('btnCopyMitra'),
  // Sample SLS
  btnOpenSampelModal: document.getElementById('btnOpenSampelModal'),
  modalSampel: document.getElementById('modalSampel'),
  btnCloseSampelModal: document.getElementById('btnCloseSampelModal'),
  sampelDropzone: document.getElementById('sampelDropzone'),
  sampelFileInput: document.getElementById('sampelFileInput'),
  btnDownloadSampelTemplate: document.getElementById('btnDownloadSampelTemplate'),
  sampelUploadSection: document.getElementById('sampelUploadSection'),
  sampelError: document.getElementById('sampelError'),
  sampelResultSection: document.getElementById('sampelResultSection'),
  sampelSummary: document.getElementById('sampelSummary'),
  sampelFailedBox: document.getElementById('sampelFailedBox'),
  sampelFailedTitle: document.getElementById('sampelFailedTitle'),
  sampelFailedList: document.getElementById('sampelFailedList'),
  btnDownloadSampelFailed: document.getElementById('btnDownloadSampelFailed'),
  sampelKecFilter: document.getElementById('sampelKecFilter'),
  sampelList: document.getElementById('sampelList'),
  sampelFooter: document.getElementById('sampelFooter'),
  btnSampelViewMap: document.getElementById('btnSampelViewMap'),
  btnSampelReplace: document.getElementById('btnSampelReplace'),
  btnSampelClear2: document.getElementById('btnSampelClear2'),
  sampelWidget: document.getElementById('sampelWidget'),
  sampelWidgetTitle: document.getElementById('sampelWidgetTitle'),
  btnSampelList: document.getElementById('btnSampelList'),
  btnSampelClear: document.getElementById('btnSampelClear'),
  sampelInfo: document.getElementById('sampelInfo'),
  sampelInfoText: document.getElementById('sampelInfoText')
};

/**
 * 1. Initialize Map & Basemaps
 */
function initMap() {
  // Default Center of Selayar Island (Benteng area)
  const defaultCenter = [-6.1215, 120.4623];
  const defaultZoom = 11;

  state.map = L.map('map', {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: false,
    preferCanvas: true // High performance rendering for 700+ multipolygons
  });


  // Define Tile Layers with multi-subdomain support for high concurrency on iOS Safari
  state.basemapLayers = {
    'google-satellite': L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Satelit'
    }),
    hybrid: L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Hybrid'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; World Imagery'
    }),
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  };

  // Add default basemap: Google Maps Satelit
  state.basemapLayers['google-satellite'].addTo(state.map);
  document.body.classList.add('basemap-satellite');

  // Setup click-on-map reverse lookup
  state.map.on('click', onMapClick);

  // Resize handler for iPhone Safari dynamic viewport
  window.addEventListener('resize', () => {
    if (state.map) state.map.invalidateSize();
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (state.map) state.map.invalidateSize();
    }, 200);
  });
}

/**
 * 2. Basemap Switcher Logic
 */
function isSatelliteBasemap() {
  return state.activeBasemap === 'google-satellite' || state.activeBasemap === 'satellite' || state.activeBasemap === 'hybrid';
}

function setBasemap(type, { silent = false } = {}) {
  if (!state.basemapLayers[type]) return;

  // Remove all current basemaps
  Object.values(state.basemapLayers).forEach(layer => {
    if (state.map.hasLayer(layer)) {
      state.map.removeLayer(layer);
    }
  });

  // Add selected basemap
  state.basemapLayers[type].addTo(state.map);
  state.activeBasemap = type;

  const isSat = isSatelliteBasemap();

  // Update body class for satellite theme styling
  if (isSat) {
    document.body.classList.add('basemap-satellite');
  } else {
    document.body.classList.remove('basemap-satellite');
  }

  // If geojson layer is loaded, update boundary colors & bring to front
  if (state.geojsonLayer) {
    state.geojsonLayer.setStyle(getSlsNormalStyle);
    state.geojsonLayer.bringToFront();
  }

  // If highlight layer is active, update highlight style & bring to front
  if (state.highlightLayer) {
    state.highlightLayer.setStyle(isSat ? SATELLITE_HIGHLIGHT_STYLE : NORMAL_HIGHLIGHT_STYLE);
    state.highlightLayer.bringToFront();
  }

  const radio = DOM.basemapOptions && DOM.basemapOptions.querySelector(`input[value="${type}"]`);
  if (radio) radio.checked = true;

  applyLayerOrder();
  if (!silent) showToast(`Peta dasar diubah ke: ${getBasemapLabel(type)}`, 'info');
}

function getBasemapLabel(type) {
  switch (type) {
    case 'google-satellite': return 'Google Maps Satelit';
    case 'hybrid': return 'Google Maps Hybrid';
    case 'satellite': return 'Citra Satelit Esri';
    case 'osm': return 'OpenStreetMap (Standar)';
    default: return type;
  }
}

/**
 * 3. Load & Process GeoJSON Dataset
 */
async function loadGeoJsonData() {
  try {
    DOM.loadingText.textContent = 'Mengunduh batas wilayah SLS Kepulauan Selayar...';
    const response = await fetch('./Final_SLS_202517301.geojson');
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    state.geojsonData = data;

    DOM.loadingText.textContent = 'Memproses 721 wilayah SLS & indeks spasial...';

    // Calculate BBOX and extract hierarchy with administrative codes
    const kecMap = new Map();
    const desaMap = new Map();

    data.features.forEach((feature, index) => {
      const bbox = computeFeatureBbox(feature);
      state.featuresWithBbox.push({
        index,
        feature,
        bbox // [minLng, minLat, maxLng, maxLat]
      });

      const p = feature.properties;
      const nmkec = (p.nmkec || '').trim();
      const nmdesa = (p.nmdesa || '').trim();
      const kdkec = (p.kdkec || '').trim();
      const kddesa = (p.kddesa || '').trim();

      if (nmkec && !kecMap.has(nmkec)) {
        kecMap.set(nmkec, kdkec);
      }
      const desaKey = `${nmkec}|${nmdesa}`;
      if (nmkec && nmdesa && !desaMap.has(desaKey)) {
        desaMap.set(desaKey, { kec: nmkec, desa: nmdesa, kdkec, kddesa });
      }
    });

    state.kecamatanList = Array.from(kecMap.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => a.name.localeCompare(b.name));

    state.desaList = Array.from(desaMap.values())
      .sort((a, b) => a.desa.localeCompare(b.desa));

    // Render Layer on Map
    state.geojsonLayer = L.geoJSON(data, {
      style: getSlsNormalStyle,
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const tooltipContent = `<b>[${p.kdsls || '-'}] ${p.nmsls || 'SLS'}</b><br>[${p.kddesa || '-'}] Desa ${p.nmdesa}, [${p.kdkec || '-'}] Kec ${p.nmkec}`;
        layer.bindTooltip(tooltipContent, {
          sticky: true,
          className: isSatelliteBasemap() ? 'sls-tooltip satellite-tooltip' : 'sls-tooltip',
          direction: 'top'
        });

        // Click on polygon
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setClickMarker(e.latlng.lat, e.latlng.lng);
          selectFeature(feature, e.latlng);
        });
      }
    }).addTo(state.map);

    // Compute overall bounds for Selayar
    state.selayarBounds = state.geojsonLayer.getBounds();
    state.map.fitBounds(state.selayarBounds, { padding: [20, 20] });

    populateFilterDropdowns();

    state.isGeojsonLoaded = true;

    // Fade out loading screen
    DOM.loadingOverlay.classList.add('opacity-0');
    setTimeout(() => {
      DOM.loadingOverlay.classList.add('hidden');
      if (state.map) state.map.invalidateSize();
    }, 300);

    showToast('Batas SLS Kepulauan Selayar siap digunakan!', 'success');
  } catch (err) {
    console.error('Error loading GeoJSON:', err);
    DOM.loadingText.textContent = `Gagal memuat data: ${err.message}`;
    showToast('Gagal memuat file GeoJSON. Pastikan file tersedia di repositori.', 'error');
  }
}

/**
 * Styling Rules
 */
const NORMAL_STYLE = {
  fillColor: '#0284c7',
  weight: 1.2,
  opacity: 0.85,
  color: '#0369a1',
  fillOpacity: 0.15
};

const SATELLITE_STYLE = {
  fillColor: '#38bdf8',
  weight: 1.6,
  opacity: 0.95,
  color: '#38bdf8', // bright electric cyan outline for satellite basemap
  fillOpacity: 0.18
};

const NORMAL_HIGHLIGHT_STYLE = {
  fillColor: '#f59e0b',
  weight: 3,
  opacity: 1,
  color: '#b45309',
  fillOpacity: 0.45
};

const SATELLITE_HIGHLIGHT_STYLE = {
  fillColor: '#f59e0b',
  weight: 3.5,
  opacity: 1,
  color: '#fef08a', // bright yellow border on dark satellite basemap
  fillOpacity: 0.5
};

const NORMAL_GROUP_HIGHLIGHT_STYLE = {
  fillColor: '#f59e0b',
  weight: 2,
  opacity: 0.95,
  color: '#d97706',
  fillOpacity: 0.35
};

const SATELLITE_GROUP_HIGHLIGHT_STYLE = {
  fillColor: '#f59e0b',
  weight: 2.2,
  opacity: 1,
  color: '#fef08a',
  fillOpacity: 0.4
};

const MITRA_STYLE_HAS = {
  fillColor: '#14b8a6',
  weight: 2,
  opacity: 1,
  color: '#0f766e',
  fillOpacity: 0.3
};

const MITRA_STYLE_NONE = {
  fillColor: '#94a3b8',
  weight: 1,
  opacity: 0.8,
  color: '#64748b',
  fillOpacity: 0.06
};

function getSlsNormalStyle(feature) {
  if (state.mitraMode && state.mitraList.length > 0 && feature) {
    const p = feature.properties;
    return state.mitraDesaCounts.has(`${p.kdkec}|${p.kddesa}`) ? MITRA_STYLE_HAS : MITRA_STYLE_NONE;
  }
  return isSatelliteBasemap() ? SATELLITE_STYLE : NORMAL_STYLE;
}

/**
 * Compute Bounding Box for [minLng, minLat, maxLng, maxLat]
 */
function computeFeatureBbox(feature) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const coords = feature.geometry.coordinates;

  function traverse(item) {
    if (typeof item[0] === 'number') {
      const lng = item[0];
      const lat = item[1];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    } else {
      for (let i = 0; i < item.length; i++) {
        traverse(item[i]);
      }
    }
  }

  traverse(coords);
  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Point-in-Polygon (PIP) Algorithm: Fast Ray-Casting with BBOX Pre-Filtering
 */
function findSlsByCoordinate(lat, lng) {
  if (!state.isGeojsonLoaded) return null;

  // 1. Candidate selection using BBOX pre-filter (runs in ~0.05ms)
  const candidates = state.featuresWithBbox.filter(item => {
    const [minLng, minLat, maxLng, maxLat] = item.bbox;
    return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
  });

  if (candidates.length === 0) return null;

  // 2. Exact polygon ray-casting test
  const pt = [lng, lat]; // [x, y]

  // Use Turf.js if available for precision
  if (typeof turf !== 'undefined' && turf.booleanPointInPolygon) {
    const turfPoint = turf.point(pt);
    for (const cand of candidates) {
      if (turf.booleanPointInPolygon(turfPoint, cand.feature)) {
        return cand.feature;
      }
    }
  }

  // Pure JavaScript Ray Casting Fallback
  for (const cand of candidates) {
    if (isPointInsideFeature(pt, cand.feature)) {
      return cand.feature;
    }
  }

  return null;
}

function isPointInsideFeature(pt, feature) {
  const geom = feature.geometry;
  const [x, y] = pt;

  function pointInPolygon(ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function testPolygonRings(rings) {
    if (!rings || rings.length === 0) return false;
    // Must be inside outer ring
    if (!pointInPolygon(rings[0])) return false;
    // Must NOT be inside any inner hole rings
    for (let i = 1; i < rings.length; i++) {
      if (pointInPolygon(rings[i])) return false;
    }
    return true;
  }

  if (geom.type === 'Polygon') {
    return testPolygonRings(geom.coordinates);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      if (testPolygonRings(poly)) return true;
    }
  }
  return false;
}

/**
 * 4. Feature Selection & Drawer Presentation
 */
function selectFeature(feature, clickLatLng = null, gpsAccuracy = null) {
  // Clear previous highlight
  if (state.highlightLayer) {
    state.map.removeLayer(state.highlightLayer);
    state.highlightLayer = null;
  }

  const isSat = isSatelliteBasemap();

  // Draw highlight polygon (in Cek Mitra mode every polygon of the same SLS is shown)
  state.highlightLayer = L.geoJSON(state.mitraMode ? siblingFeatures(feature) : feature, {
    style: isSat ? SATELLITE_HIGHLIGHT_STYLE : NORMAL_HIGHLIGHT_STYLE
  }).addTo(state.map);

  const p = feature.properties;

  // Calculate center coordinate for display
  let displayLat, displayLng;
  let centerLatLng;
  if (clickLatLng) {
    displayLat = clickLatLng.lat.toFixed(6);
    displayLng = clickLatLng.lng.toFixed(6);
    centerLatLng = clickLatLng;
  } else {
    centerLatLng = state.highlightLayer.getBounds().getCenter();
    displayLat = centerLatLng.lat.toFixed(6);
    displayLng = centerLatLng.lng.toFixed(6);
  }

  state.selectedFeature = feature;
  state.selectedCenterLatLng = centerLatLng;

  // Format codes for SLS, Desa, and Kecamatan
  const slsCode = p.kdsls ? `[${p.kdsls}] ` : '';
  const desaCode = p.kddesa ? `[${p.kddesa}] ` : '';
  const kecCode = p.kdkec ? `[${p.kdkec}] ` : '';

  DOM.slsName.textContent = `${slsCode}${p.nmsls || 'Tanpa Nama SLS'}`;
  DOM.slsDesaKec.textContent = `${desaCode}Desa ${p.nmdesa || '-'}, ${kecCode}Kec ${p.nmkec || '-'}`;
  DOM.slsId.textContent = p.idsls || '-';
  
  const luasVal = p.luas ? `${Number(p.luas).toFixed(3)} km²` : '-';
  DOM.slsLuas.textContent = luasVal;
  DOM.slsCoord.textContent = `${displayLat}, ${displayLng}`;

  // GPS Accuracy badge
  if (gpsAccuracy !== null) {
    DOM.badgeGpsAccuracy.textContent = `GPS ±${Math.round(gpsAccuracy)}m`;
    DOM.badgeGpsAccuracy.classList.remove('hidden');
    DOM.badgeStatus.textContent = 'Lokasi Terdeteksi';
  } else {
    DOM.badgeGpsAccuracy.classList.add('hidden');
    DOM.badgeStatus.textContent = 'SLS Terpilih';
  }

  // Google Maps navigation link
  DOM.btnGoogleMaps.href = `https://www.google.com/maps/dir/?api=1&destination=${displayLat},${displayLng}`;

  // Store data for share
  DOM.btnShareInfo.dataset.shareText = `📍 Informasi SLS Kepulauan Selayar:\n• SLS: ${slsCode}${p.nmsls || '-'}\n• Wilayah: ${desaCode}Desa ${p.nmdesa || '-'}, ${kecCode}Kec ${p.nmkec || '-'}\n• ID SLS: ${p.idsls}\n• Titik: ${displayLat}, ${displayLng}\n• Maps: https://www.google.com/maps?q=${displayLat},${displayLng}`;

  renderSampelInfo(feature);
  renderMitraSection(feature);
  applyLayerOrder();

  // Open Drawer only (no redundant on-map floating badge)
  openDrawer();
}

/**
 * Highlight multiple features (all SLS in a Kecamatan or Desa)
 */
function highlightMultipleFeatures(features, label) {
  if (state.highlightLayer) {
    state.map.removeLayer(state.highlightLayer);
    state.highlightLayer = null;
  }
  if (state.clickMarker) {
    state.map.removeLayer(state.clickMarker);
    state.clickMarker = null;
  }
  state.selectedFeature = null;
  state.selectedCenterLatLng = null;

  if (!features || features.length === 0) return;

  const isSat = isSatelliteBasemap();
  state.highlightLayer = L.geoJSON(features, {
    style: isSat ? SATELLITE_GROUP_HIGHLIGHT_STYLE : NORMAL_GROUP_HIGHLIGHT_STYLE,
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      const tooltipContent = `<b>[${p.kdsls || '-'}] ${p.nmsls || 'SLS'}</b><br>[${p.kddesa || '-'}] Desa ${p.nmdesa}, [${p.kdkec || '-'}] Kec ${p.nmkec}`;
      layer.bindTooltip(tooltipContent, {
        sticky: true,
        className: isSat ? 'sls-tooltip satellite-tooltip' : 'sls-tooltip',
        direction: 'top'
      });
      layer.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setClickMarker(e.latlng.lat, e.latlng.lng);
        selectFeature(feature, e.latlng);
      });
    }
  }).addTo(state.map);

  state.map.fitBounds(state.highlightLayer.getBounds(), { padding: [30, 30], animate: true });
  closeDrawer(true);
  showToast(`Menampilkan & highlight ${label} (${features.length} SLS)`, 'info');
}

/**
 * Right panel: status cards + SLS detail. It docks beside the map on wide screens
 * and below it on phones. "Minimize" collapses it, "Perbesar" (phones) makes it taller.
 */

/** lucide.createIcons() swaps <i> for <svg>, so a kept reference goes stale: rebuild the tag by id. */
function setLucideIcon(id, name) {
  const el = document.getElementById(id);
  if (!el) return;
  const i = document.createElement('i');
  i.id = id;
  i.className = el.getAttribute('class') || '';
  i.setAttribute('data-lucide', name);
  el.replaceWith(i);
  lucide.createIcons();
}

function setDrawerMaximized(on) {
  DOM.sidePanel.classList.toggle('is-maximized', on);
  DOM.btnMaximizeDrawer.setAttribute('aria-label', on ? 'Kecilkan panel' : 'Perbesar panel');
  DOM.btnMaximizeDrawer.title = on ? 'Kecilkan panel' : 'Perbesar panel';
  setLucideIcon('drawerMaxIcon', on ? 'minimize-2' : 'maximize-2');
}

/** Show the SLS detail card in the panel (and expand the panel unless told otherwise). */
function openDrawer(minimized = false) {
  hideReopenPill();
  DOM.bottomSheet.classList.remove('hidden-drawer');
  DOM.bottomSheet.classList.add('show-drawer');
  DOM.panelEmpty.classList.add('hidden');
  if (minimized) {
    minimizeDrawer();
  } else {
    expandDrawer();
    DOM.bottomSheet.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/** Hide the SLS detail card; the panel shows its hint again. */
function closeDrawer(clearPill = false) {
  DOM.bottomSheet.classList.remove('show-drawer');
  DOM.bottomSheet.classList.add('hidden-drawer');
  DOM.panelEmpty.classList.remove('hidden');
  if (clearPill || !state.selectedFeature) {
    hideReopenPill();
  } else {
    showReopenPill();
  }
}

function setPanelCollapsed(collapsed) {
  state.isDrawerMinimized = collapsed;
  DOM.sidePanel.classList.toggle('is-collapsed', collapsed);
  document.body.classList.toggle('panel-collapsed', collapsed);
  DOM.panelToggleLabel.textContent = collapsed ? 'Buka' : 'Minimize';
  DOM.btnToggleDrawer.setAttribute('aria-label', collapsed ? 'Buka panel' : 'Perkecil panel');
  DOM.btnToggleDrawer.title = collapsed ? 'Buka panel' : 'Perkecil panel';
  DOM.btnToggleDrawer.setAttribute('aria-expanded', String(!collapsed));
}

function minimizeDrawer() {
  setDrawerMaximized(false);
  setPanelCollapsed(true);
}

function expandDrawer() {
  setPanelCollapsed(false);
}

function toggleDrawerMinimize() {
  if (state.isDrawerMinimized) {
    expandDrawer();
  } else {
    minimizeDrawer();
  }
}

function showReopenPill() {
  if (!state.selectedFeature || !DOM.btnReopenDrawer) return;
  const p = state.selectedFeature.properties;
  const code = p.kdsls ? `[${p.kdsls}] ` : '';
  DOM.reopenSlsName.textContent = `${code}${p.nmsls || 'Detail SLS'}`;
  DOM.btnReopenDrawer.classList.remove('hidden');
  lucide.createIcons();
}

function hideReopenPill() {
  if (DOM.btnReopenDrawer) {
    DOM.btnReopenDrawer.classList.add('hidden');
  }
}

/**
 * 5. Map Click Event (Interactive Point Tap)
 */
function onMapClick(e) {
  const { lat, lng } = e.latlng;

  // Check which SLS contains this point
  const feature = findSlsByCoordinate(lat, lng);

  if (feature) {
    setClickMarker(lat, lng);
    selectFeature(feature, e.latlng);
  } else {
    // When clicking outside Kepulauan Selayar: do NOT show marker and NO toast warning
    if (state.clickMarker) {
      state.map.removeLayer(state.clickMarker);
      state.clickMarker = null;
    }
    if (state.highlightLayer) {
      state.map.removeLayer(state.highlightLayer);
      state.highlightLayer = null;
    }
    state.selectedFeature = null;
    state.selectedCenterLatLng = null;
    closeDrawer(true);
  }
}

function setClickMarker(lat, lng) {
  if (state.clickMarker) {
    state.map.removeLayer(state.clickMarker);
  }

  const pinIcon = L.divIcon({
    className: 'custom-pin',
    html: `<div class="w-6 h-6 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle></svg></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  state.clickMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(state.map);
}

/**
 * 6. Live Geolocation (Tombol Lokasi Sekarang)
 */
function handleGeolocation() {
  if (!navigator.geolocation) {
    showToast('Peramban Anda tidak mendukung fitur Geolocation GPS.', 'error');
    return;
  }

  // Check secure context for mobile browsers (iOS Safari & Chrome Android require HTTPS for GPS)
  if (window.isSecureContext === false && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    showToast('GPS pada HP wajib menggunakan koneksi aman (HTTPS). Buka dengan https://', 'error');
    return;
  }

  // Show loading indicator on button
  DOM.btnGps.disabled = true;
  DOM.btnGps.classList.add('opacity-80');
  DOM.gpsIcon.classList.add('animate-spin');
  showToast('Mencari sinyal GPS akurat...', 'info');

  const onLocationSuccess = (position) => {
    DOM.btnGps.disabled = false;
    DOM.btnGps.classList.remove('opacity-80');
    DOM.gpsIcon.classList.remove('animate-spin');

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy || 10;

    // Update GPS visual marker
    updateGpsMarker(lat, lng, accuracy);

    // Zoom to user location
    state.map.setView([lat, lng], 17, { animate: true });

    // Run spatial check
    const feature = findSlsByCoordinate(lat, lng);
    if (feature) {
      selectFeature(feature, { lat, lng }, accuracy);
      showToast(`Lokasi terdeteksi di: [${feature.properties.kdsls || '-'}] ${feature.properties.nmsls}`, 'success');
    } else {
      if (state.highlightLayer) {
        state.map.removeLayer(state.highlightLayer);
        state.highlightLayer = null;
      }
      state.selectedFeature = null;
      state.selectedCenterLatLng = null;
      closeDrawer(true);
      showToast(`Lokasi GPS terdeteksi (${lat.toFixed(5)}, ${lng.toFixed(5)}) berada di luar batas wilayah SLS Selayar.`, 'warning');
    }
  };

  const onLocationError = (error) => {
    // If high accuracy times out on mobile, fallback to standard cellular/wifi accuracy
    if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
      navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        (fallbackErr) => {
          DOM.btnGps.disabled = false;
          DOM.btnGps.classList.remove('opacity-80');
          DOM.gpsIcon.classList.remove('animate-spin');
          showToast(getGeoErrorMessage(fallbackErr), 'error');
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
      return;
    }

    DOM.btnGps.disabled = false;
    DOM.btnGps.classList.remove('opacity-80');
    DOM.gpsIcon.classList.remove('animate-spin');
    showToast(getGeoErrorMessage(error), 'error');
  };

  navigator.geolocation.getCurrentPosition(
    onLocationSuccess,
    onLocationError,
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
  );
}

function getGeoErrorMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Izin akses GPS ditolak. Silakan aktifkan izin lokasi di peramban HP.';
    case error.POSITION_UNAVAILABLE:
      return 'Sinyal posisi GPS tidak tersedia pada perangkat.';
    case error.TIMEOUT:
      return 'Waktu pencarian sinyal GPS habis. Coba pastikan GPS HP aktif.';
    default:
      return 'Gagal mendeteksi lokasi GPS.';
  }
}

function updateGpsMarker(lat, lng, accuracy) {
  if (state.gpsMarker) state.map.removeLayer(state.gpsMarker);
  if (state.gpsCircle) state.map.removeLayer(state.gpsCircle);

  // Pulsing blue dot
  const pulseIcon = L.divIcon({
    className: 'gps-pulse-icon',
    html: '<div class="gps-pulse-ring"></div><div class="gps-pulse-dot"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  state.gpsMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(state.map);

  // Accuracy circle
  state.gpsCircle = L.circle([lat, lng], {
    radius: accuracy,
    color: '#0284c7',
    fillColor: '#38bdf8',
    fillOpacity: 0.15,
    weight: 1
  }).addTo(state.map);
}

/**
 * 7. Home Button Action (Reset ke Selayar)
 */
function handleHomeButton() {
  if (!state.selayarBounds) return;

  state.map.fitBounds(state.selayarBounds, {
    padding: [20, 20],
    animate: true,
    duration: 1
  });

  if (state.clickMarker) {
    state.map.removeLayer(state.clickMarker);
    state.clickMarker = null;
  }
  if (state.highlightLayer) {
    state.map.removeLayer(state.highlightLayer);
    state.highlightLayer = null;
  }
  state.selectedFeature = null;
  state.selectedCenterLatLng = null;
  closeDrawer(true);

  showToast('Tampilan peta dikembalikan ke Kabupaten Kepulauan Selayar', 'info');
}

/**
 * 8. Search Engine (Unified Instant Search)
 */
function initSearch() {
  let debounceTimeout = null;

  DOM.searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    const query = e.target.value.trim().toLowerCase();

    if (query.length > 0) {
      DOM.clearSearchBtn.classList.remove('hidden');
    } else {
      DOM.clearSearchBtn.classList.add('hidden');
      DOM.searchSuggestions.classList.add('hidden');
      return;
    }

    debounceTimeout = setTimeout(() => {
      performSearch(query);
    }, 180);
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    DOM.searchSuggestions.classList.add('hidden');
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchInput') && !e.target.closest('#searchSuggestions')) {
      DOM.searchSuggestions.classList.add('hidden');
    }
  });
}

function performSearch(query) {
  if (!state.geojsonData) return;

  const results = [];
  const q = query.toLowerCase();

  // 1. Search Kecamatan matches
  state.kecamatanList.forEach(k => {
    if (k.name.toLowerCase().includes(q)) {
      results.push({
        type: 'kecamatan',
        title: `[${k.code}] Kecamatan ${k.name}`,
        subtitle: 'Kabupaten Kepulauan Selayar',
        value: k.name
      });
    }
  });

  // 2. Search Desa matches
  state.desaList.forEach(item => {
    if (item.desa.toLowerCase().includes(q)) {
      results.push({
        type: 'desa',
        title: `[${item.kddesa}] Desa ${item.desa}`,
        subtitle: `[${item.kdkec}] Kecamatan ${item.kec}`,
        value: item
      });
    }
  });

  // 3. Search SLS matches & ID SLS
  let slsMatches = 0;
  for (const item of state.featuresWithBbox) {
    if (slsMatches >= 25) break; // Limit suggestions
    const p = item.feature.properties;
    const nmsls = (p.nmsls || '').toLowerCase();
    const idsls = (p.idsls || '').toLowerCase();

    if (nmsls.includes(q) || idsls.includes(q)) {
      const slsCode = p.kdsls ? `[${p.kdsls}] ` : '';
      const desaCode = p.kddesa ? `[${p.kddesa}] ` : '';
      const kecCode = p.kdkec ? `[${p.kdkec}] ` : '';
      results.push({
        type: 'sls',
        title: `${slsCode}${p.nmsls || 'SLS'}`,
        subtitle: `${desaCode}Desa ${p.nmdesa}, ${kecCode}Kec ${p.nmkec} (ID: ${p.idsls})`,
        value: item.feature
      });
      slsMatches++;
    }
  }

  renderSuggestions(results);
}

function renderSuggestions(results) {
  if (results.length === 0) {
    DOM.searchSuggestions.innerHTML = `
      <div class="p-3 text-xs text-slate-400 text-center bg-slate-900">
        Tidak ditemukan SLS, Desa, atau Kecamatan yang cocok.
      </div>
    `;
    DOM.searchSuggestions.classList.remove('hidden');
    return;
  }

  DOM.searchSuggestions.innerHTML = results.slice(0, 20).map((res, index) => {
    let badgeClass = 'bg-slate-800 text-slate-200 border border-slate-700';
    let badgeText = 'SLS';

    if (res.type === 'kecamatan') {
      badgeClass = 'bg-indigo-900 text-indigo-200 border border-indigo-700';
      badgeText = 'KECAMATAN';
    } else if (res.type === 'desa') {
      badgeClass = 'bg-emerald-900 text-emerald-200 border border-emerald-700';
      badgeText = 'DESA';
    }

    return `
      <div class="suggestion-item p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition" data-index="${index}">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeClass} uppercase flex-shrink-0">
            ${badgeText}
          </span>
          <div class="truncate">
            <div class="suggestion-title text-sm font-semibold text-slate-100 truncate">${res.title}</div>
            <div class="suggestion-subtitle text-xs text-slate-400 truncate">${res.subtitle}</div>
          </div>
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500 flex-shrink-0 ml-2"></i>
      </div>
    `;
  }).join('');

  DOM.searchSuggestions.classList.remove('hidden');
  lucide.createIcons();

  // Attach click events
  DOM.searchSuggestions.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.index, 10);
      handleSelectSuggestion(results[idx]);
    });
  });
}

function handleSelectSuggestion(item) {
  DOM.searchSuggestions.classList.add('hidden');
  DOM.searchInput.value = item.title;
  DOM.clearSearchBtn.classList.remove('hidden');

  if (item.type === 'sls') {
    const feature = item.value;
    const tempLayer = L.geoJSON(feature);
    const bounds = tempLayer.getBounds();
    state.map.fitBounds(bounds, { maxZoom: 17, padding: [40, 40], animate: true });
    const center = bounds.getCenter();
    setClickMarker(center.lat, center.lng);
    selectFeature(feature, center);
    const p = feature.properties;
    showToast(`Menampilkan: [${p.kdsls || '-'}] ${p.nmsls}`, 'success');
  } else if (item.type === 'desa') {
    const desaObj = item.value;
    const desaFeatures = state.featuresWithBbox
      .filter(f => f.feature.properties.nmkec === desaObj.kec && f.feature.properties.nmdesa === desaObj.desa)
      .map(f => f.feature);
    highlightMultipleFeatures(desaFeatures, `[${desaObj.kddesa}] Desa ${desaObj.desa}`);
  } else if (item.type === 'kecamatan') {
    const kecName = item.value;
    const kecFeatures = state.featuresWithBbox
      .filter(f => f.feature.properties.nmkec === kecName)
      .map(f => f.feature);
    const kecObj = state.kecamatanList.find(k => k.name === kecName);
    const kecCode = kecObj ? `[${kecObj.code}] ` : '';
    highlightMultipleFeatures(kecFeatures, `${kecCode}Kecamatan ${kecName}`);
  }
}

/**
 * 9. Coordinate Lookup Modal Logic
 */
function initCoordinateModal() {
  DOM.btnOpenCoordModal.addEventListener('click', () => {
    DOM.modalCoord.classList.remove('hidden-modal');
    DOM.modalCoord.classList.add('show-modal');
    DOM.inputCoordQuick.focus();
  });

  DOM.btnCloseCoordModal.addEventListener('click', () => {
    DOM.modalCoord.classList.remove('show-modal');
    DOM.modalCoord.classList.add('hidden-modal');
  });

  // Sample coordinate buttons
  document.querySelectorAll('.sample-coord-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = btn.dataset.lat;
      const lng = btn.dataset.lng;
      DOM.inputCoordQuick.value = `${lat}, ${lng}`;
      DOM.inputLat.value = lat;
      DOM.inputLng.value = lng;
    });
  });

  DOM.btnSubmitCoord.addEventListener('click', processCoordinateInput);
}

function processCoordinateInput() {
  let lat = null;
  let lng = null;

  const quickVal = DOM.inputCoordQuick.value.trim();
  const latVal = DOM.inputLat.value.trim();
  const lngVal = DOM.inputLng.value.trim();

  if (quickVal) {
    // Parse "lat, lng" or "lat lng"
    const cleaned = quickVal.replace(/[^\d.,\s-]/g, '').trim();
    const parts = cleaned.split(/[\s,]+/).filter(Boolean);
    if (parts.length >= 2) {
      lat = parseFloat(parts[0]);
      lng = parseFloat(parts[1]);
    }
  } else if (latVal && lngVal) {
    lat = parseFloat(latVal);
    lng = parseFloat(lngVal);
  }

  if (isNaN(lat) || isNaN(lng) || lat === null || lng === null) {
    showToast('Format koordinat tidak valid. Contoh: -6.49178, 120.48547', 'error');
    return;
  }

  // Smart detector: Indonesia/Selayar Latitude is around -5 to -8, Longitude is around 120 to 122
  if (lat > 90 && lng < 0) {
    const temp = lat;
    lat = lng;
    lng = temp;
    showToast('Posisi Lintang & Bujur tertukar otomatis disesuaikan.', 'info');
  }

  // Close modal
  DOM.modalCoord.classList.remove('show-modal');
  DOM.modalCoord.classList.add('hidden-modal');

  // Lookup SLS
  const feature = findSlsByCoordinate(lat, lng);
  if (feature) {
    setClickMarker(lat, lng);
    state.map.setView([lat, lng], 16, { animate: true });
    selectFeature(feature, { lat, lng });
    showToast(`Koordinat masuk ke: [${feature.properties.kdsls || '-'}] ${feature.properties.nmsls}`, 'success');
  } else {
    // Do NOT show marker outside Selayar
    if (state.clickMarker) {
      state.map.removeLayer(state.clickMarker);
      state.clickMarker = null;
    }
    if (state.highlightLayer) {
      state.map.removeLayer(state.highlightLayer);
      state.highlightLayer = null;
    }
    state.selectedFeature = null;
    state.selectedCenterLatLng = null;
    closeDrawer(true);
    showToast(`Koordinat (${lat.toFixed(5)}, ${lng.toFixed(5)}) di luar SLS Kepulauan Selayar.`, 'warning');
  }
}

/**
 * 10. Filter Hierarki Wilayah Modal
 */
function initFilterModal() {
  DOM.btnOpenFilterModal.addEventListener('click', () => {
    DOM.modalFilter.classList.remove('hidden-modal');
    DOM.modalFilter.classList.add('show-modal');
  });

  DOM.btnCloseFilterModal.addEventListener('click', () => {
    DOM.modalFilter.classList.remove('show-modal');
    DOM.modalFilter.classList.add('hidden-modal');
  });

  DOM.filterKecamatan.addEventListener('change', () => {
    const selKec = DOM.filterKecamatan.value;
    DOM.filterDesa.innerHTML = '<option value="">Semua desa di kecamatan ini</option>';
    DOM.filterSls.innerHTML = '<option value="">Pilih desa dulu</option>';
    DOM.filterSls.disabled = true;

    if (!selKec) {
      DOM.filterDesa.disabled = true;
      DOM.btnApplyFilter.disabled = true;
      return;
    }

    const filteredDesa = state.desaList.filter(d => d.kec === selKec);
    filteredDesa.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.desa;
      opt.textContent = `[${d.kddesa}] Desa ${d.desa}`;
      DOM.filterDesa.appendChild(opt);
    });

    DOM.filterDesa.disabled = false;
    DOM.btnApplyFilter.disabled = false;
  });

  DOM.filterDesa.addEventListener('change', () => {
    const selKec = DOM.filterKecamatan.value;
    const selDesa = DOM.filterDesa.value;
    DOM.filterSls.innerHTML = '<option value="">Semua SLS di desa ini</option>';

    if (!selDesa) {
      DOM.filterSls.disabled = true;
      return;
    }

    const slsInDesa = state.featuresWithBbox.filter(
      f => f.feature.properties.nmkec === selKec && f.feature.properties.nmdesa === selDesa
    );

    slsInDesa.forEach(item => {
      const p = item.feature.properties;
      const opt = document.createElement('option');
      opt.value = p.idsls;
      opt.textContent = `[${p.kdsls || '-'}] ${p.nmsls || 'SLS'} (${p.idsls})`;
      DOM.filterSls.appendChild(opt);
    });

    DOM.filterSls.disabled = false;
  });

  DOM.btnApplyFilter.addEventListener('click', () => {
    const kec = DOM.filterKecamatan.value;
    const desa = DOM.filterDesa.value;
    const slsId = DOM.filterSls.value;

    DOM.modalFilter.classList.remove('show-modal');
    DOM.modalFilter.classList.add('hidden-modal');

    if (slsId) {
      const target = state.featuresWithBbox.find(f => f.feature.properties.idsls === slsId);
      if (target) {
        const bounds = L.geoJSON(target.feature).getBounds();
        state.map.fitBounds(bounds, { maxZoom: 17, padding: [40, 40] });
        const center = bounds.getCenter();
        setClickMarker(center.lat, center.lng);
        selectFeature(target.feature, center);
      }
    } else if (desa) {
      const desaFeatures = state.featuresWithBbox
        .filter(f => f.feature.properties.nmkec === kec && f.feature.properties.nmdesa === desa)
        .map(f => f.feature);
      const desaObj = state.desaList.find(d => d.kec === kec && d.desa === desa);
      const desaCode = desaObj ? `[${desaObj.kddesa}] ` : '';
      highlightMultipleFeatures(desaFeatures, `${desaCode}Desa ${desa}`);
    } else if (kec) {
      const kecFeatures = state.featuresWithBbox
        .filter(f => f.feature.properties.nmkec === kec)
        .map(f => f.feature);
      const kecObj = state.kecamatanList.find(k => k.name === kec);
      const kecCode = kecObj ? `[${kecObj.code}] ` : '';
      highlightMultipleFeatures(kecFeatures, `${kecCode}Kecamatan ${kec}`);
    }
  });
}

function populateFilterDropdowns() {
  DOM.filterKecamatan.innerHTML = '<option value="">Semua kecamatan</option>';
  state.kecamatanList.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k.name;
    opt.textContent = `[${k.code}] Kec. ${k.name}`;
    DOM.filterKecamatan.appendChild(opt);
  });
}

/**
 * 11. Basemap Picker Modal Logic
 */
function initBasemapModal() {
  DOM.btnBasemap.addEventListener('click', () => {
    DOM.modalBasemap.classList.remove('hidden-modal');
    DOM.modalBasemap.classList.add('show-modal');
  });

  DOM.btnCloseBasemapModal.addEventListener('click', () => {
    DOM.modalBasemap.classList.remove('show-modal');
    DOM.modalBasemap.classList.add('hidden-modal');
  });

  DOM.basemapOptions.querySelectorAll('input[name="basemapChoice"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      setBasemap(e.target.value);
      DOM.modalBasemap.classList.remove('show-modal');
      DOM.modalBasemap.classList.add('hidden-modal');
    });
  });
}

/**
 * 12. Clipboard & Share Helpers
 */
function initClipboardActions() {
  DOM.btnCopyId.addEventListener('click', () => {
    const id = DOM.slsId.textContent;
    if (id && id !== '-') {
      navigator.clipboard.writeText(id);
      showToast(`ID SLS (${id}) disalin ke clipboard!`, 'success');
    }
  });

  DOM.btnCopyCoord.addEventListener('click', () => {
    const coord = DOM.slsCoord.textContent;
    if (coord && coord !== '-') {
      navigator.clipboard.writeText(coord);
      showToast(`Koordinat (${coord}) disalin ke clipboard!`, 'success');
    }
  });

  DOM.btnShareInfo.addEventListener('click', () => {
    const text = DOM.btnShareInfo.dataset.shareText;
    if (text) {
      if (navigator.share) {
        navigator.share({
          title: 'Informasi SLS Kepulauan Selayar',
          text: text
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(text);
        showToast('Ringkasan info SLS disalin ke clipboard!', 'success');
      }
    }
  });

  // Drawer Interactive Controls (Minimalist Hide/Show & Reopen)
  DOM.btnCloseDrawer.addEventListener('click', () => closeDrawer(false));
  
  DOM.btnMaximizeDrawer.addEventListener('click', () => {
    if (state.isDrawerMinimized) expandDrawer();
    setDrawerMaximized(!DOM.sidePanel.classList.contains('is-maximized'));
  });

  DOM.btnToggleDrawer.addEventListener('click', toggleDrawerMinimize);
  DOM.btnPanelHandle.addEventListener('click', expandDrawer);
  DOM.btnReopenDrawer.addEventListener('click', () => openDrawer(false));
}

/**
 * Toast Notification Engine
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  let bgClass = 'bg-slate-900 text-white border-slate-700';
  let iconName = 'info';

  if (type === 'success') {
    bgClass = 'bg-emerald-600 text-white border-emerald-500';
    iconName = 'check-circle';
  } else if (type === 'warning') {
    bgClass = 'bg-amber-600 text-white border-amber-500';
    iconName = 'alert-triangle';
  } else if (type === 'error') {
    bgClass = 'bg-rose-600 text-white border-rose-500';
    iconName = 'alert-circle';
  }

  toast.className = `${bgClass} px-4 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 border transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto`;
  toast.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i><span>${message}</span>`;

  DOM.toastContainer.appendChild(toast);
  lucide.createIcons();

  // Animation in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Register Service Worker for PWA Offline Caching
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('ServiceWorker registered with scope:', reg.scope);
      }).catch(err => {
        console.warn('ServiceWorker registration failed:', err);
      });
    });
  }
}

/**
 * Modal Backdrop Click & Keyboard (ESC) Dismissal
 */
function initModalBackdrops() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show-modal');
        modal.classList.add('hidden-modal');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.show-modal').forEach(modal => {
        modal.classList.remove('show-modal');
        modal.classList.add('hidden-modal');
      });
      if (DOM.searchSuggestions) {
        DOM.searchSuggestions.classList.add('hidden');
      }
    }
  });
}

/**
 * 13. Excel Coordinate Batch Processing & Mapping
 */
function initExcelModal() {
  // Modal Open/Close
  DOM.btnOpenExcelModal.addEventListener('click', () => {
    DOM.modalExcel.classList.remove('hidden-modal');
    DOM.modalExcel.classList.add('show-modal');
  });

  DOM.btnCloseExcelModal.addEventListener('click', () => {
    DOM.modalExcel.classList.remove('show-modal');
    DOM.modalExcel.classList.add('hidden-modal');
  });

  // Switch to Excel Modal from Coord Modal
  const btnSwitchFromCoord = document.getElementById('btnSwitchToExcelFromCoord');
  if (btnSwitchFromCoord) {
    btnSwitchFromCoord.addEventListener('click', () => {
      DOM.modalCoord.classList.remove('show-modal');
      DOM.modalCoord.classList.add('hidden-modal');
      DOM.modalExcel.classList.remove('hidden-modal');
      DOM.modalExcel.classList.add('show-modal');
    });
  }

  // Drag and Drop & File Input
  DOM.excelDropzone.addEventListener('click', () => {
    DOM.excelFileInput.click();
  });

  DOM.excelFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleExcelFile(e.target.files[0]);
    }
  });

  DOM.excelDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.excelDropzone.classList.add('border-emerald-500', 'bg-slate-800');
  });

  DOM.excelDropzone.addEventListener('dragleave', () => {
    DOM.excelDropzone.classList.remove('border-emerald-500', 'bg-slate-800');
  });

  DOM.excelDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.excelDropzone.classList.remove('border-emerald-500', 'bg-slate-800');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleExcelFile(e.dataTransfer.files[0]);
    }
  });

  // Template Download
  DOM.btnDownloadExcelTemplate.addEventListener('click', downloadExcelTemplate);

  // Process Button
  DOM.btnProcessExcelData.addEventListener('click', processExcelCoordinates);

  // View on Map & Export
  DOM.btnViewExcelOnMap.addEventListener('click', () => {
    DOM.modalExcel.classList.remove('show-modal');
    DOM.modalExcel.classList.add('hidden-modal');
    plotExcelPointsOnMap();
  });

  DOM.btnExportExcelResult.addEventListener('click', exportVerifiedExcel);

  // Reset Button (Upload File Lain)
  DOM.btnResetExcel.addEventListener('click', resetExcelUploadState);

  // Floating Widget actions
  DOM.btnToggleExcelVisibility.addEventListener('click', toggleExcelPointsVisibility);
  DOM.btnClearExcelPoints.addEventListener('click', clearExcelPoints);
  DOM.btnReopenExcelModal.addEventListener('click', () => {
    DOM.modalExcel.classList.remove('hidden-modal');
    DOM.modalExcel.classList.add('show-modal');
  });

  // Table filter tabs
  document.querySelectorAll('.excel-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.excel-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderExcelResultsTable(btn.dataset.filter);
    });
  });
}

function resetExcelUploadState() {
  DOM.excelFileInput.value = '';
  DOM.excelUploadSection.classList.remove('hidden');
  DOM.excelMappingSection.classList.add('hidden');
  DOM.excelResultSection.classList.add('hidden');
  DOM.btnResetExcel.classList.add('hidden');
  DOM.btnExportExcelResult.disabled = true;
  DOM.btnViewExcelOnMap.disabled = true;
  state.excelRawData = [];
  state.excelHeaders = [];
  state.excelFileName = '';
}

function handleExcelFile(file) {
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  if (!['xlsx', 'xls', 'csv'].includes(ext)) {
    showToast('Format file harus .xlsx, .xls, atau .csv', 'error');
    return;
  }

  if (typeof XLSX === 'undefined') {
    showToast('Pustaka SheetJS belum termuat. Periksa koneksi internet.', 'error');
    return;
  }

  state.excelFileName = file.name;
  DOM.excelFileMeta.textContent = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (!jsonRows || jsonRows.length === 0) {
        showToast('File Excel kosong atau tidak memiliki baris data.', 'warning');
        return;
      }

      state.excelRawData = jsonRows;
      state.excelHeaders = Object.keys(jsonRows[0]);

      populateExcelColumnSelectors();

      DOM.excelUploadSection.classList.add('hidden');
      DOM.excelMappingSection.classList.remove('hidden');
      DOM.excelResultSection.classList.add('hidden');
      DOM.btnResetExcel.classList.remove('hidden');

      showToast(`File "${file.name}" berhasil dibaca (${jsonRows.length} baris)`, 'success');
      lucide.createIcons();
    } catch (err) {
      console.error('Error reading Excel file:', err);
      showToast(`Gagal membaca file Excel: ${err.message}`, 'error');
    }
  };

  reader.onerror = () => {
    showToast('Gagal membuka file.', 'error');
  };

  reader.readAsArrayBuffer(file);
}

function populateExcelColumnSelectors() {
  const headers = state.excelHeaders;

  DOM.selectLatCol.innerHTML = '';
  DOM.selectLngCol.innerHTML = '';
  DOM.selectLabelCol.innerHTML = '<option value="">-- (Opsional) Nomor Urut Saja --</option>';

  headers.forEach(h => {
    const opt1 = document.createElement('option');
    opt1.value = h;
    opt1.textContent = h;
    DOM.selectLatCol.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = h;
    opt2.textContent = h;
    DOM.selectLngCol.appendChild(opt2);

    const opt3 = document.createElement('option');
    opt3.value = h;
    opt3.textContent = h;
    DOM.selectLabelCol.appendChild(opt3);
  });

  const latPatterns = ['lat', 'latitude', 'lintang', 'y', 'koordinatlat', 'coordlat'];
  const lngPatterns = ['lon', 'long', 'lng', 'longitude', 'bujur', 'x', 'koordinatlng', 'coordlng'];
  const labelPatterns = ['nama', 'name', 'label', 'responden', 'keterangan', 'ket', 'id', 'sls', 'no'];

  function norm(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  const detectedLat = headers.find(h => latPatterns.includes(norm(h))) ||
                      headers.find(h => latPatterns.some(p => norm(h).includes(p)));

  const detectedLng = headers.find(h => lngPatterns.includes(norm(h))) ||
                      headers.find(h => lngPatterns.some(p => norm(h).includes(p)));

  const detectedLabel = headers.find(h => labelPatterns.includes(norm(h))) ||
                        headers.find(h => labelPatterns.some(p => norm(h).includes(p)));

  if (detectedLat) DOM.selectLatCol.value = detectedLat;
  if (detectedLng) DOM.selectLngCol.value = detectedLng;
  if (detectedLabel) DOM.selectLabelCol.value = detectedLabel;
}

function processExcelCoordinates() {
  const latCol = DOM.selectLatCol.value;
  const lngCol = DOM.selectLngCol.value;
  const labelCol = DOM.selectLabelCol.value;

  if (!latCol || !lngCol) {
    showToast('Pilih kolom Latitude dan Longitude terlebih dahulu.', 'warning');
    return;
  }

  const processed = [];
  let inCount = 0;
  let outCount = 0;
  let invalidCount = 0;

  state.excelRawData.forEach((row, index) => {
    const rawLat = row[latCol];
    const rawLng = row[lngCol];

    let lat = parseFloat(String(rawLat).replace(',', '.').trim());
    let lng = parseFloat(String(rawLng).replace(',', '.').trim());

    const label = labelCol && row[labelCol] !== undefined && row[labelCol] !== ''
      ? String(row[labelCol]).trim()
      : `Titik #${index + 1}`;

    // Auto-swap detector for Indonesia/Selayar (Lat is ~ -5 to -8, Lng is ~ 120 to 122)
    if (lat > 90 && lng < 0) {
      const temp = lat;
      lat = lng;
      lng = temp;
    }

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      invalidCount++;
      processed.push({
        index,
        label,
        lat: isNaN(lat) ? null : lat,
        lng: isNaN(lng) ? null : lng,
        status: 'invalid',
        sls: null,
        feature: null
      });
      return;
    }

    // Spatial lookup against Selayar SLS polygons
    const feature = findSlsByCoordinate(lat, lng);
    if (feature) {
      inCount++;
      processed.push({
        index,
        label,
        lat,
        lng,
        status: 'inside',
        sls: feature.properties,
        feature
      });
    } else {
      outCount++;
      processed.push({
        index,
        label,
        lat,
        lng,
        status: 'outside',
        sls: null,
        feature: null
      });
    }
  });

  state.excelPoints = processed;

  // Update Statistics UI
  DOM.statTotalPoints.textContent = processed.length;
  DOM.statInPoints.textContent = inCount;
  DOM.statOutPoints.textContent = outCount;
  DOM.tabCountAll.textContent = processed.length;
  DOM.tabCountIn.textContent = inCount;
  DOM.tabCountOut.textContent = outCount;

  // Show results section
  DOM.excelResultSection.classList.remove('hidden');
  DOM.btnExportExcelResult.disabled = false;
  DOM.btnViewExcelOnMap.disabled = (inCount + outCount === 0);

  renderExcelResultsTable('all');
  lucide.createIcons();

  showToast(`Verifikasi selesai: ${inCount} titik di dalam SLS, ${outCount} titik di luar Selayar.`, 'success');
}

function renderExcelResultsTable(filter = 'all') {
  let list = state.excelPoints;
  if (filter === 'inside') {
    list = list.filter(p => p.status === 'inside');
  } else if (filter === 'outside') {
    list = list.filter(p => p.status === 'outside');
  }

  if (list.length === 0) {
    DOM.excelTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="p-4 text-center text-slate-400 text-xs">
          Tidak ada data untuk filter ini.
        </td>
      </tr>
    `;
    return;
  }

  DOM.excelTableBody.innerHTML = list.map(item => {
    let statusBadge = '';
    let slsDetail = '-';

    if (item.status === 'inside' && item.sls) {
      statusBadge = '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">Masuk SLS</span>';
      slsDetail = `<b>[${item.sls.kdsls || '-'}] ${escapeHtml(item.sls.nmsls)}</b><br><span class="text-slate-400 text-[10px]">Desa ${escapeHtml(item.sls.nmdesa)}, Kec ${escapeHtml(item.sls.nmkec)}</span>`;
    } else if (item.status === 'outside') {
      statusBadge = '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">Luar Selayar</span>';
      slsDetail = '<span class="text-rose-400 text-[10px]">Di luar batas poligon</span>';
    } else {
      statusBadge = '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Invalid</span>';
      slsDetail = '<span class="text-slate-500 text-[10px]">Koordinat tidak valid</span>';
    }

    const coordStr = (item.lat !== null && item.lng !== null)
      ? `${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}`
      : 'Invalid';

    return `
      <tr class="hover:bg-slate-800/60 transition">
        <td class="p-2 font-mono text-slate-400 text-[11px]">${item.index + 1}</td>
        <td class="p-2 font-medium text-slate-100 max-w-[120px] truncate" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</td>
        <td class="p-2 font-mono text-[11px] text-slate-300 whitespace-nowrap">${coordStr}</td>
        <td class="p-2 leading-tight">${statusBadge}<div class="mt-0.5">${slsDetail}</div></td>
        <td class="p-2 text-right">
          ${item.lat !== null ? `
            <button class="btn-focus-excel-point p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition" data-idx="${item.index}" title="Lihat Titik di Peta">
              <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
            </button>
          ` : '-'}
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();

  DOM.excelTableBody.querySelectorAll('.btn-focus-excel-point').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      focusExcelPointOnMap(idx);
    });
  });
}

function focusExcelPointOnMap(index) {
  const pt = state.excelPoints.find(p => p.index === index);
  if (!pt || pt.lat === null || pt.lng === null) return;

  DOM.modalExcel.classList.remove('show-modal');
  DOM.modalExcel.classList.add('hidden-modal');

  if (!state.excelPointsLayer) {
    plotExcelPointsOnMap();
  }

  state.map.setView([pt.lat, pt.lng], 17, { animate: true });

  if (pt.status === 'inside' && pt.feature) {
    selectFeature(pt.feature, { lat: pt.lat, lng: pt.lng });
  } else {
    setClickMarker(pt.lat, pt.lng);
  }
}

function plotExcelPointsOnMap() {
  if (!state.map) return;

  if (state.excelPointsLayer) {
    state.map.removeLayer(state.excelPointsLayer);
    state.excelPointsLayer = null;
  }

  const validPoints = state.excelPoints.filter(p => p.status !== 'invalid');
  if (validPoints.length === 0) {
    showToast('Tidak ada titik valid untuk diplot di peta.', 'warning');
    return;
  }

  const layerGroup = L.layerGroup();
  const latLngs = [];

  validPoints.forEach((pt) => {
    const isInside = pt.status === 'inside';
    const color = isInside ? '#10b981' : '#f43f5e';
    const fillColor = isInside ? '#34d399' : '#fb7185';

    const marker = L.circleMarker([pt.lat, pt.lng], {
      radius: 6.5,
      fillColor: fillColor,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
      pane: 'markerPane'
    });

    let popupHtml = `
      <div class="text-xs text-slate-100">
        <div class="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5 mb-1.5">
          <span class="font-bold text-slate-200">#${pt.index + 1} ${escapeHtml(pt.label)}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isInside ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'}">
            ${isInside ? 'DI DALAM SLS' : 'DI LUAR SELAYAR'}
          </span>
        </div>
        <div class="space-y-1 font-mono text-[11px] text-slate-300">
          <div><span class="text-slate-400">Koordinat:</span> ${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)}</div>
    `;

    if (isInside && pt.sls) {
      const p = pt.sls;
      popupHtml += `
          <div class="mt-1 pt-1 border-t border-slate-800 font-sans">
            <div class="font-bold text-sky-300">[${p.kdsls || '-'}] ${escapeHtml(p.nmsls || 'SLS')}</div>
            <div class="text-slate-400 text-[10px]">Desa ${escapeHtml(p.nmdesa || '-')}, Kec ${escapeHtml(p.nmkec || '-')}</div>
            <div class="text-slate-400 text-[10px]">ID SLS: ${p.idsls || '-'}</div>
          </div>
      `;
    }

    popupHtml += `
        </div>
        <div class="mt-2.5 pt-1.5 border-t border-slate-800 flex items-center gap-1.5">
    `;

    if (isInside && pt.feature) {
      popupHtml += `
          <button class="btn-highlight-sls-popup flex-1 py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[11px] text-center transition" data-idx="${pt.index}">
            Sorot Poligon SLS
          </button>
      `;
    }

    popupHtml += `
          <a href="https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}" target="_blank" rel="noopener noreferrer" class="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] text-center transition">
            Maps
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      className: 'excel-point-popup',
      maxWidth: 290
    });

    marker.on('popupopen', () => {
      const btn = document.querySelector(`.btn-highlight-sls-popup[data-idx="${pt.index}"]`);
      if (btn && pt.feature) {
        btn.addEventListener('click', () => {
          selectFeature(pt.feature, { lat: pt.lat, lng: pt.lng });
          marker.closePopup();
        });
      }
    });

    layerGroup.addLayer(marker);
    latLngs.push([pt.lat, pt.lng]);
  });

  state.excelPointsLayer = layerGroup.addTo(state.map);
  state.isExcelLayerVisible = true;

  if (latLngs.length > 0) {
    const bounds = L.latLngBounds(latLngs);
    state.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
  }

  updateExcelFloatingWidget();
  showToast(`Menampilkan ${validPoints.length} titik koordinat dari Excel di peta.`, 'info');
}

function updateExcelFloatingWidget() {
  if (!state.excelPoints || state.excelPoints.length === 0) {
    DOM.excelPointsWidget.classList.add('hidden');
    return;
  }

  const inCount = state.excelPoints.filter(p => p.status === 'inside').length;
  const outCount = state.excelPoints.filter(p => p.status === 'outside').length;
  const total = inCount + outCount;

  DOM.excelWidgetTitle.textContent = `${total} Titik Excel`;
  DOM.excelWidgetInCount.textContent = inCount;
  DOM.excelWidgetOutCount.textContent = outCount;

  DOM.excelPointsWidget.classList.remove('hidden');
  lucide.createIcons();
}

function toggleExcelPointsVisibility() {
  if (!state.excelPointsLayer) return;

  if (state.isExcelLayerVisible) {
    state.map.removeLayer(state.excelPointsLayer);
    state.isExcelLayerVisible = false;
    DOM.excelEyeIcon.setAttribute('data-lucide', 'eye-off');
    showToast('Layer titik Excel disembunyikan.', 'info');
  } else {
    state.excelPointsLayer.addTo(state.map);
    state.isExcelLayerVisible = true;
    DOM.excelEyeIcon.setAttribute('data-lucide', 'eye');
    showToast('Layer titik Excel ditampilkan.', 'info');
  }
  lucide.createIcons();
}

function clearExcelPoints() {
  if (state.excelPointsLayer) {
    state.map.removeLayer(state.excelPointsLayer);
    state.excelPointsLayer = null;
  }
  state.excelPoints = [];
  DOM.excelPointsWidget.classList.add('hidden');
  resetExcelUploadState();
  showToast('Titik koordinat Excel telah dihapus dari peta.', 'info');
}

function exportVerifiedExcel() {
  if (!state.excelPoints || state.excelPoints.length === 0) {
    showToast('Tidak ada data untuk diekspor.', 'warning');
    return;
  }

  const exportRows = state.excelPoints.map(pt => {
    const originalRow = { ...(state.excelRawData[pt.index] || {}) };
    const p = pt.sls || {};

    const verified = {
      'STATUS_VERIFIKASI': pt.status === 'inside' ? 'DI DALAM SLS' : (pt.status === 'outside' ? 'DI LUAR SLS SELAYAR' : 'KOORDINAT INVALID'),
      'LAT_VERIFIKASI': pt.lat !== null ? pt.lat : '',
      'LNG_VERIFIKASI': pt.lng !== null ? pt.lng : '',
      'ID_SLS_TERDETEKSI': p.idsls || '',
      'KODE_SLS': p.kdsls || '',
      'NAMA_SLS_TERDETEKSI': p.nmsls || '',
      'KODE_DESA': p.kddesa || '',
      'DESA_TERDETEKSI': p.nmdesa || '',
      'KODE_KEC': p.kdkec || '',
      'KECAMATAN_TERDETEKSI': p.nmkec || '',
      'KABUPATEN': p.nmkab || ''
    };

    return { ...originalRow, ...verified };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Hasil_Verifikasi_SLS');

  const base = (state.excelFileName || 'Koordinat_Selayar').replace(/\.[^/.]+$/, '');
  const outName = `Hasil_Verifikasi_SLS_${base}.xlsx`;

  XLSX.writeFile(wb, outName);
  showToast(`File "${outName}" berhasil diunduh!`, 'success');
}

function downloadExcelTemplate() {
  const sampleData = [
    {
      No: 1,
      ID_Responden: 'R-7301-001',
      Nama_Kepala_Keluarga: 'Ahmad Yani',
      Latitude: -6.1215,
      Longitude: 120.4623,
      Keterangan: 'Contoh responden di Kota Benteng'
    },
    {
      No: 2,
      ID_Responden: 'R-7301-002',
      Nama_Kepala_Keluarga: 'H. Daeng Maruntung',
      Latitude: -6.4907,
      Longitude: 120.4828,
      Keterangan: 'Contoh responden di Dusun Bunging, Appatanah'
    },
    {
      No: 3,
      ID_Responden: 'R-7301-003',
      Nama_Kepala_Keluarga: 'Siti Rahmawati',
      Latitude: -6.7025,
      Longitude: 121.1520,
      Keterangan: 'Contoh responden di Kepulauan Takabonerate'
    },
    {
      No: 4,
      ID_Responden: 'R-7301-004',
      Nama_Kepala_Keluarga: 'Baharuddin (Outlier)',
      Latitude: -5.1476,
      Longitude: 119.4327,
      Keterangan: 'Contoh titik di luar Selayar (Makassar) untuk uji deteksi outlier'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Koordinat');
  XLSX.writeFile(wb, 'Template_Upload_Koordinat_Selayar.xlsx');
  showToast('Template Excel berhasil diunduh!', 'success');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 14. Shared helpers for Cek Mitra & sample SLS
 */
function openModalEl(el) {
  el.classList.remove('hidden-modal');
  el.classList.add('show-modal');
}

function closeModalEl(el) {
  el.classList.remove('show-modal');
  el.classList.add('hidden-modal');
}

function applyLayerOrder() {
  if (state.sampelLayer) state.sampelLayer.bringToFront();
  if (state.highlightLayer) state.highlightLayer.bringToFront();
  if (state.excelPointsLayer && state.excelPointsLayer.bringToFront) state.excelPointsLayer.bringToFront();
}

function getFeaturesById() {
  if (!state.featuresById) {
    state.featuresById = new Map();
    state.featuresWithBbox.forEach(({ feature }) => {
      const id = SlsLib.canonicalId(feature.properties);
      if (!state.featuresById.has(id)) state.featuresById.set(id, []);
      state.featuresById.get(id).push(feature);
    });
  }
  return state.featuresById;
}

function siblingFeatures(feature) {
  return getFeaturesById().get(SlsLib.canonicalId(feature.properties)) || [feature];
}

function copyText(text, okMessage) {
  const done = () => showToast(okMessage, 'success');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => showToast('Gagal menyalin. Salin manual dari layar.', 'error'));
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    done();
  } catch (e) {
    showToast('Gagal menyalin. Salin manual dari layar.', 'error');
  }
  document.body.removeChild(ta);
}

function hasSpreadsheetExt(file) {
  return ['xlsx', 'xls', 'csv'].includes((file.name.split('.').pop() || '').toLowerCase());
}

function readWorkbookSheets(file) {
  return new Promise((resolve, reject) => {
    if (typeof XLSX === 'undefined') {
      reject(new Error('Pustaka Excel belum termuat. Periksa koneksi internet lalu muat ulang halaman.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File tidak bisa dibaca.'));
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
        resolve(wb.SheetNames.map((name) => ({
          name,
          rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', raw: false, blankrows: true })
        })));
      } catch (err) {
        reject(new Error('File rusak atau formatnya tidak didukung.'));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 15. Cek Mitra mode
 */
function initMitra() {
  DOM.btnToggleMitra.addEventListener('click', () => (state.mitraMode ? exitMitraMode() : enterMitraMode()));
  DOM.btnLoadMitra.addEventListener('click', () => DOM.mitraFileInput.click());
  DOM.btnToggleMitraBanner.addEventListener('click', () => {
    state.mitraBannerCollapsed = !state.mitraBannerCollapsed;
    updateMitraUi();
  });
  DOM.mitraFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleMitraFile(file);
    e.target.value = '';
  });
  DOM.mitraSearch.addEventListener('input', renderMitraCards);
  DOM.btnCopyMitra.addEventListener('click', copyMitraList);
}

function enterMitraMode() {
  if (!state.isGeojsonLoaded) {
    showToast('Tunggu peta selesai dimuat.', 'info');
    return;
  }
  state.mitraMode = true;
  state.prevBasemap = state.activeBasemap;
  setBasemap('osm', { silent: true });
  state.geojsonLayer.setStyle(getSlsNormalStyle);
  updateMitraUi();
  if (MITRA_DATA_URL && state.mitraList.length === 0) loadMitraFromUrl();
  if (state.selectedFeature) renderMitraSection(state.selectedFeature);
}

function exitMitraMode() {
  state.mitraMode = false;
  if (state.activeBasemap === 'osm' && state.prevBasemap && state.prevBasemap !== 'osm') {
    setBasemap(state.prevBasemap, { silent: true });
  }
  state.prevBasemap = null;
  state.geojsonLayer.setStyle(getSlsNormalStyle);
  updateMitraUi();
  DOM.mitraSection.classList.add('hidden');
  if (state.selectedFeature && DOM.bottomSheet.classList.contains('show-drawer')) {
    selectFeature(state.selectedFeature, state.selectedCenterLatLng);
  }
}

function updateMitraUi() {
  const on = state.mitraMode;
  const loaded = state.mitraList.length > 0;
  DOM.btnToggleMitra.setAttribute('aria-pressed', String(on));
  DOM.btnToggleMitraLabel.textContent = on ? 'Keluar Cek Mitra' : 'Cek Mitra';
  DOM.mitraBanner.classList.toggle('hidden', !on);
  DOM.mitraLegend.classList.toggle('hidden', !loaded);
  const collapsed = state.mitraBannerCollapsed;
  DOM.mitraBanner.classList.toggle('is-collapsed', collapsed);
  DOM.btnToggleMitraBanner.setAttribute('aria-expanded', String(!collapsed));
  DOM.btnToggleMitraBanner.setAttribute('aria-label', collapsed ? 'Perbesar panel Cek Mitra' : 'Perkecil panel Cek Mitra');
  DOM.btnToggleMitraBanner.title = collapsed ? 'Perbesar' : 'Perkecil';
  setLucideIcon('mitraBannerIcon', collapsed ? 'chevron-down' : 'chevron-up');
  if (collapsed) {
    DOM.mitraBannerText.textContent = loaded ? `Cek Mitra aktif · ${state.mitraList.length} mitra` : 'Cek Mitra aktif · data belum dimuat';
  } else {
    DOM.mitraBannerText.textContent = loaded
      ? 'Ketuk wilayah di peta untuk melihat mitranya.'
      : 'Muat data mitra dulu, lalu ketuk wilayah di peta.';
  }
  DOM.btnLoadMitraLabel.textContent = loaded ? 'Ganti Data' : 'Muat Data Mitra';
  DOM.btnLoadMitra.classList.toggle('bg-slate-700', loaded);
  DOM.btnLoadMitra.classList.toggle('hover:bg-slate-600', loaded);
  DOM.btnLoadMitra.classList.toggle('bg-teal-600', !loaded);
  DOM.btnLoadMitra.classList.toggle('hover:bg-teal-500', !loaded);
  DOM.mitraDataMeta.classList.toggle('hidden', !loaded);
  DOM.mitraDataMeta.textContent = loaded ? `${state.mitraList.length} mitra dari ${state.mitraSource}` : '';
}

function setMitraData(list, source) {
  state.mitraList = list;
  state.mitraSource = source;
  state.mitraDesaCounts = new Map();
  list.forEach((m) => {
    const key = `${m.kdkec}|${m.kddesa}`;
    state.mitraDesaCounts.set(key, (state.mitraDesaCounts.get(key) || 0) + 1);
  });
  if (state.geojsonLayer) state.geojsonLayer.setStyle(getSlsNormalStyle);
  applyLayerOrder();
  updateMitraUi();
  if (state.selectedFeature) renderMitraSection(state.selectedFeature);
}

function pickBestMitraSheet(sheets) {
  let best = null;
  sheets.forEach((sh) => {
    const r = SlsLib.parseMitra(sh.rows);
    if (r.mitra.length > (best ? best.mitra.length : 0)) best = r;
  });
  return best;
}

async function handleMitraFile(file) {
  if (!hasSpreadsheetExt(file)) {
    showToast('Format file harus .xlsx, .xls, atau .csv', 'error');
    return;
  }
  try {
    const sheets = await readWorkbookSheets(file);
    const best = pickBestMitraSheet(sheets);
    if (!best) {
      showToast('File ini tidak berisi data mitra. Pastikan ada kolom Nama Lengkap dan Alamat Desa/Kel.', 'error');
      return;
    }
    setMitraData(best.mitra, file.name);
    showToast(`${best.mitra.length} mitra dimuat. Data hanya ada di perangkat Anda.`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadMitraFromUrl() {
  try {
    const res = await fetch(MITRA_DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const wb = XLSX.read(await res.text(), { type: 'string' });
    const sheets = wb.SheetNames.map((name) => ({
      name,
      rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', raw: false, blankrows: true })
    }));
    const best = pickBestMitraSheet(sheets);
    if (!best) throw new Error('format data tidak dikenali');
    setMitraData(best.mitra, 'data terbaru');
  } catch (err) {
    showToast('Data mitra belum bisa dimuat. Peta SLS tetap bisa dipakai. Anda bisa memuat file sendiri.', 'error');
  }
}

const MITRA_LEVELS = {
  tepat: { label: 'Tepat di SLS ini', cls: 'bg-teal-500/20 text-teal-200 border-teal-500/40' },
  dusun: { label: 'Dusun cocok', cls: 'bg-sky-500/20 text-sky-200 border-sky-500/40' },
  desa: { label: 'Di desa ini', cls: 'bg-slate-600/40 text-slate-200 border-slate-500/50' }
};

function renderMitraSection(feature) {
  if (!state.mitraMode) {
    DOM.mitraSection.classList.add('hidden');
    return;
  }
  DOM.mitraSection.classList.remove('hidden');
  const p = feature.properties;
  const desa = p.nmdesa || '-';

  if (state.mitraList.length === 0) {
    state.currentMitraRows = [];
    DOM.mitraSummary.textContent = 'Data mitra belum dimuat';
    DOM.mitraSubSummary.textContent = 'Ketuk "Muat Data Mitra" di bagian atas peta, lalu pilih file Excel daftar mitra.';
    DOM.mitraSearch.classList.add('hidden');
    DOM.btnCopyMitra.classList.add('hidden');
    DOM.mitraList.innerHTML = '';
    return;
  }

  const rows = SlsLib.mitraForSls(state.mitraList, p);
  state.currentMitraRows = rows;
  const n = { tepat: 0, dusun: 0, desa: 0 };
  rows.forEach((r) => n[r.level]++);

  if (rows.length === 0) {
    DOM.mitraSummary.textContent = `Belum ada mitra tercatat di Desa ${desa}`;
    DOM.mitraSubSummary.textContent = 'Coba lihat desa tetangga.';
  } else {
    DOM.mitraSummary.textContent = `${rows.length} mitra di Desa ${desa}`;
    const parts = [];
    if (n.tepat) parts.push(`${n.tepat} tepat di SLS ini`);
    if (n.dusun) parts.push(`${n.dusun} dusun cocok`);
    if (n.desa) parts.push(`${n.desa} lainnya di desa ini`);
    let sub = parts.join(' · ');
    if (!n.tepat) sub += '. Data belum mencatat RT/SLS tiap mitra, jadi daftar ini per desa.';
    DOM.mitraSubSummary.textContent = sub;
  }
  DOM.mitraSearch.value = '';
  DOM.mitraSearch.classList.toggle('hidden', rows.length <= 8);
  DOM.btnCopyMitra.classList.toggle('hidden', rows.length === 0);
  renderMitraCards();
}

function renderMitraCards() {
  const q = SlsLib.normalizeText(DOM.mitraSearch.value);
  const rows = q
    ? state.currentMitraRows.filter((r) => SlsLib.normalizeText(r.mitra.nama).includes(q))
    : state.currentMitraRows;
  if (state.currentMitraRows.length > 0 && rows.length === 0) {
    DOM.mitraList.innerHTML = '<p class="text-xs text-slate-400 py-2">Tidak ada nama yang cocok.</p>';
    return;
  }
  DOM.mitraList.innerHTML = rows.map(({ mitra: m, level }) => {
    const lv = MITRA_LEVELS[level];
    const chips = [];
    if (m.capi) chips.push('Pengalaman CAPI');
    if (m.android) chips.push('HP Android');
    if (m.motor) chips.push('Bisa motor');
    if (m.pengalaman.length) chips.push(`Pernah: ${m.pengalaman.join(', ')}`);
    return `<div class="mitra-card">
      <div class="flex items-start justify-between gap-2">
        <span class="font-semibold text-slate-100 text-xs leading-snug">${escapeHtml(m.nama)}</span>
        <span class="flex-shrink-0 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${lv.cls}">${lv.label}</span>
      </div>
      <div class="text-[11px] text-slate-400 mt-0.5">${escapeHtml(m.posisi)}${m.alamat ? ' · ' + escapeHtml(m.alamat) : ''}</div>
      ${chips.length ? `<div class="flex flex-wrap gap-1 mt-1">${chips.map((c) => `<span class="px-1.5 py-0.5 rounded-md bg-slate-700/60 text-[10px] text-slate-300">${escapeHtml(c)}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');
}

function copyMitraList() {
  const f = state.selectedFeature;
  if (!f || state.currentMitraRows.length === 0) return;
  const p = f.properties;
  const lines = state.currentMitraRows.map(({ mitra: m, level }, i) =>
    `${i + 1}. ${m.nama} - ${m.posisi}${m.alamat ? ` (${m.alamat})` : ''} [${MITRA_LEVELS[level].label}]`);
  copyText(`Mitra ${p.nmsls}, Desa ${p.nmdesa}, Kec ${p.nmkec}\n${lines.join('\n')}`, 'Daftar mitra disalin.');
}

/**
 * 16. Sample SLS upload (DSLS)
 */
const SAMPEL_STYLE = {
  fillColor: '#c026d3',
  fillOpacity: 0.4,
  color: '#f0abfc',
  weight: 3,
  opacity: 1
};

function initSampel() {
  DOM.btnOpenSampelModal.addEventListener('click', () => {
    showSampelView(state.sampel ? 'result' : 'upload');
    openModalEl(DOM.modalSampel);
  });
  DOM.btnCloseSampelModal.addEventListener('click', () => closeModalEl(DOM.modalSampel));
  DOM.btnMinimizeSampel.addEventListener('click', () => closeModalEl(DOM.modalSampel));
  DOM.btnSampelList.addEventListener('click', () => {
    showSampelView('result');
    openModalEl(DOM.modalSampel);
  });
  DOM.btnSampelClear.addEventListener('click', clearSampel);
  DOM.btnSampelClear2.addEventListener('click', clearSampel);
  DOM.btnSampelReplace.addEventListener('click', () => showSampelView('upload'));
  DOM.btnSampelViewMap.addEventListener('click', () => {
    closeModalEl(DOM.modalSampel);
    zoomToSampel();
  });
  DOM.btnDownloadSampelTemplate.addEventListener('click', downloadSampelTemplate);
  DOM.btnDownloadSampelFailed.addEventListener('click', downloadSampelFailed);
  DOM.sampelKecFilter.addEventListener('change', renderSampelList);

  DOM.sampelDropzone.addEventListener('click', () => DOM.sampelFileInput.click());
  DOM.sampelDropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      DOM.sampelFileInput.click();
    }
  });
  DOM.sampelFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleSampelFile(file);
    e.target.value = '';
  });
  DOM.sampelDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.sampelDropzone.classList.add('border-fuchsia-500/70');
  });
  DOM.sampelDropzone.addEventListener('dragleave', () => DOM.sampelDropzone.classList.remove('border-fuchsia-500/70'));
  DOM.sampelDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.sampelDropzone.classList.remove('border-fuchsia-500/70');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleSampelFile(file);
  });
}

function showSampelView(view) {
  const result = view === 'result' && state.sampel;
  DOM.sampelUploadSection.classList.toggle('hidden', !!result);
  DOM.sampelResultSection.classList.toggle('hidden', !result);
  DOM.sampelFooter.classList.toggle('hidden', !result);
  DOM.btnMinimizeSampel.classList.toggle('hidden', !result);
  if (!result) hideSampelError();
}

function showSampelError(message) {
  DOM.sampelError.textContent = message;
  DOM.sampelError.classList.remove('hidden');
}

function hideSampelError() {
  DOM.sampelError.classList.add('hidden');
  DOM.sampelError.textContent = '';
}

async function handleSampelFile(file) {
  hideSampelError();
  if (!hasSpreadsheetExt(file)) {
    showSampelError('Format file harus .xlsx, .xls, atau .csv.');
    return;
  }
  if (!state.isGeojsonLoaded) {
    showSampelError('Peta belum selesai dimuat. Coba lagi sebentar lagi.');
    return;
  }

  let sheets;
  try {
    sheets = await readWorkbookSheets(file);
  } catch (err) {
    showSampelError(err.message);
    return;
  }

  // A workbook may hold several tabs; use the one that yields the most sample rows.
  const first = state.geojsonData.features[0].properties;
  const defaults = { kdprov: first.kdprov, kdkab: first.kdkab };
  let best = null;
  sheets.forEach((sh) => {
    const parsed = SlsLib.parseDsls(sh.rows, defaults);
    const better = parsed.entries.length > (best ? best.parsed.entries.length : 0) ||
      (best && parsed.entries.length > 0 && parsed.entries.length === best.parsed.entries.length && /^dsls$/i.test(sh.name));
    if (better) best = { sheet: sh.name, parsed };
  });
  if (!best) {
    showSampelError('File ini tidak terbaca sebagai daftar SLS sampel. Pastikan ada kolom Kode SLS dan Kecamatan, atau unduh template.');
    return;
  }

  const { matched, failed } = SlsLib.matchEntries(best.parsed.entries, state.geojsonData.features);
  state.sampel = { fileName: file.name, total: best.parsed.entries.length, matched, failed };
  state.sampelByKey = new Map();
  matched.forEach((m) => state.sampelByKey.set(SlsLib.canonicalId(m.features[0].properties), m));

  plotSampel();
  renderSampelResult();
  showSampelView('result');
  if (state.selectedFeature) renderSampelInfo(state.selectedFeature);
}

function plotSampel() {
  if (state.sampelLayer) {
    state.map.removeLayer(state.sampelLayer);
    state.sampelLayer = null;
  }
  const s = state.sampel;
  const total = s ? s.matched.length : 0;
  DOM.sampelWidget.classList.toggle('hidden', total === 0);
  if (!s || total === 0) return;
  const features = s.matched.flatMap((m) => m.features);
  state.sampelLayer = L.geoJSON(features, { style: SAMPEL_STYLE, interactive: false }).addTo(state.map);
  DOM.sampelWidgetTitle.textContent = `${total} SLS Sampel`;
  applyLayerOrder();
  zoomToSampel();
}

function zoomToSampel() {
  if (state.sampelLayer) {
    state.map.fitBounds(state.sampelLayer.getBounds(), { padding: [50, 50], animate: true });
  }
}

function renderSampelResult() {
  const s = state.sampel;
  DOM.sampelSummary.textContent = `${s.matched.length} dari ${s.total} SLS sampel ditemukan dan disorot di peta.`;
  if (s.failed.length > 0) {
    DOM.sampelSummary.textContent = `${s.matched.length} dari ${s.total} SLS sampel ditemukan. ${s.failed.length} baris tidak cocok dengan peta.`;
    DOM.sampelFailedBox.classList.remove('hidden');
    DOM.sampelFailedTitle.textContent = `${s.failed.length} baris tidak cocok`;
    DOM.sampelFailedList.innerHTML = s.failed.map(({ entry: e, reason }) =>
      `<li>Baris ${e.rowNumber}: ${escapeHtml(e.nmsls || e.idsls || '(tanpa nama)')} <span class="text-amber-300">${escapeHtml(reason)}</span></li>`).join('');
  } else {
    DOM.sampelFailedBox.classList.add('hidden');
  }

  const kecs = [...new Set(s.matched.map((m) => m.features[0].properties.nmkec))].sort();
  DOM.sampelKecFilter.innerHTML = '<option value="">Semua kecamatan</option>' +
    kecs.map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('');
  renderSampelList();
}

function renderSampelList() {
  const s = state.sampel;
  if (!s) return;
  const kec = DOM.sampelKecFilter.value;
  const items = s.matched
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => !kec || m.features[0].properties.nmkec === kec);
  DOM.sampelList.innerHTML = items.map(({ m, i }) => {
    const p = m.features[0].properties;
    const meta = [m.entry.nks && `NKS ${m.entry.nks}`, m.entry.petugas].filter(Boolean).join(' · ');
    return `<li><button type="button" data-sampel-index="${i}" class="w-full text-left mitra-card hover:border-fuchsia-500/60 transition">
      <span class="block text-xs font-semibold text-slate-100">[${escapeHtml(p.kdsls)}] ${escapeHtml(p.nmsls)}</span>
      <span class="block text-[11px] text-slate-400 mt-0.5">Desa ${escapeHtml(p.nmdesa)}, Kec ${escapeHtml(p.nmkec)}${meta ? ' · ' + escapeHtml(meta) : ''}</span>
    </button></li>`;
  }).join('');
  DOM.sampelList.querySelectorAll('button[data-sampel-index]').forEach((btn) => {
    btn.addEventListener('click', () => focusSampel(Number(btn.dataset.sampelIndex)));
  });
}

function focusSampel(index) {
  const m = state.sampel && state.sampel.matched[index];
  if (!m) return;
  closeModalEl(DOM.modalSampel);
  state.map.fitBounds(L.geoJSON(m.features).getBounds(), { padding: [60, 60], animate: true, maxZoom: 17 });
  selectFeature(m.features[0], null);
}

function clearSampel() {
  if (state.sampelLayer) {
    state.map.removeLayer(state.sampelLayer);
    state.sampelLayer = null;
  }
  state.sampel = null;
  state.sampelByKey = new Map();
  DOM.sampelWidget.classList.add('hidden');
  DOM.sampelInfo.classList.add('hidden');
  showSampelView('upload');
  closeModalEl(DOM.modalSampel);
  showToast('Sorotan SLS sampel dihapus.', 'info');
}

function renderSampelInfo(feature) {
  const m = state.sampelByKey && state.sampelByKey.get(SlsLib.canonicalId(feature.properties));
  const sub = m && m.entry.kdsub !== '00' ? m.entry.kdsub : null;
  const isSample = m && (!sub || String(feature.properties.kdsubsls).padStart(2, '0') === sub);
  if (!isSample) {
    DOM.sampelInfo.classList.add('hidden');
    return;
  }
  const e = m.entry;
  DOM.sampelInfoText.textContent = [
    e.nks && `NKS ${e.nks}`,
    `Petugas: ${e.petugas || '-'}`,
    e.keluarga && `Perkiraan keluarga SE2026: ${e.keluarga}`
  ].filter(Boolean).join(' · ');
  DOM.sampelInfo.classList.remove('hidden');
}

function downloadSampelTemplate() {
  const ws = XLSX.utils.json_to_sheet([
    { 'Kode Kec': '030', 'Kode Desa': '003', 'Kode SLS': '0002', 'Nama SLS': 'RT 02 RK 02 DUSUN BUNGING' }
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_SLS_Sampel');
  XLSX.writeFile(wb, 'Template_SLS_Sampel_Selayar.xlsx');
}

function downloadSampelFailed() {
  const s = state.sampel;
  if (!s || s.failed.length === 0) return;
  const rows = s.failed.map(({ entry: e, reason }) => ({
    Baris: e.rowNumber,
    'ID SLS': e.idsls,
    Kecamatan: e.nmkec,
    Desa: e.nmdesa,
    'Nama SLS': e.nmsls,
    Alasan: reason
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Baris_Gagal');
  XLSX.writeFile(wb, 'SLS_Sampel_Gagal_Dicocokkan.xlsx');
}


/* ------------------------------ theme ------------------------------ */

const THEME_KEY = 'sls-theme';
const THEME_COLOR = { dark: '#0f172a', light: '#f8fafc' };

function applyTheme(theme, persist = false) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLOR[theme]);
  const toLight = theme === 'dark';
  const label = toLight ? 'Ganti ke tema terang' : 'Ganti ke tema gelap';
  DOM.btnTheme.setAttribute('aria-label', label);
  DOM.btnTheme.title = label;
  setLucideIcon('themeIcon', toLight ? 'sun' : 'moon');
  if (persist) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
  }
}

function initTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  applyTheme(current);
  DOM.btnTheme.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
  });
  // Follow the system only while the user has not picked a theme by hand
  if (window.matchMedia) {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      let saved = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch (err) { /* ignore */ }
      if (!saved) applyTheme(SlsLib.resolveTheme(null, e.matches));
    });
  }
}

/* ------------------------- resizable right panel ------------------------- */

const PANEL_DOCKED_QUERY = '(min-width: 768px), (orientation: landscape) and (max-height: 500px)';
const PANEL_LIMITS = {
  w: { key: 'sls-panel-w', min: 300, max: 720, def: 380, prop: '--panel-w' },
  h: { key: 'sls-panel-h', min: 140, max: 9999, def: 0, prop: '--panel-h' }
};

function panelAxis() {
  return window.matchMedia(PANEL_DOCKED_QUERY).matches ? 'w' : 'h';
}

/** Largest size the panel may take: at most 60% of the shell width, or 75% of its height on phones. */
function panelMax(axis) {
  const shell = document.getElementById('shell').getBoundingClientRect();
  const lim = PANEL_LIMITS[axis];
  return axis === 'w' ? Math.min(lim.max, shell.width * 0.6) : shell.height * 0.75;
}

function setPanelSize(axis, px, persist = false) {
  const lim = PANEL_LIMITS[axis];
  const size = SlsLib.clampPanelSize(px, lim.min, panelMax(axis), lim.def || lim.min);
  document.documentElement.style.setProperty(lim.prop, size + 'px');
  if (axis === 'h') setDrawerMaximized(false);
  DOM.panelResizer.setAttribute('aria-valuenow', String(size));
  DOM.panelResizer.setAttribute('aria-valuemin', String(lim.min));
  DOM.panelResizer.setAttribute('aria-valuemax', String(Math.round(panelMax(axis))));
  if (persist) {
    try { localStorage.setItem(lim.key, String(size)); } catch (e) { /* ignore */ }
  }
  return size;
}

function resetPanelSize(axis) {
  const lim = PANEL_LIMITS[axis];
  document.documentElement.style.removeProperty(lim.prop);
  try { localStorage.removeItem(lim.key); } catch (e) { /* ignore */ }
  DOM.panelResizer.removeAttribute('aria-valuenow');
}

function currentPanelSize(axis) {
  const r = DOM.sidePanel.getBoundingClientRect();
  return axis === 'w' ? r.width : r.height;
}

function initPanelResizer() {
  const handle = DOM.panelResizer;

  const syncOrientation = () => {
    const axis = panelAxis();
    handle.setAttribute('aria-orientation', axis === 'w' ? 'vertical' : 'horizontal');
    handle.setAttribute('aria-label', axis === 'w' ? 'Ubah lebar panel' : 'Ubah tinggi panel');
    // Sizes saved for the other layout are ignored; keep the stored one in range for this one
    let saved = null;
    try { saved = localStorage.getItem(PANEL_LIMITS[axis].key); } catch (e) { /* ignore */ }
    if (saved != null) setPanelSize(axis, Number(saved));
  };
  syncOrientation();
  window.matchMedia(PANEL_DOCKED_QUERY).addEventListener('change', () => {
    // Each layout has its own variable; drop the one that no longer applies
    ['w', 'h'].forEach((a) => document.documentElement.style.removeProperty(PANEL_LIMITS[a].prop));
    syncOrientation();
  });
  window.addEventListener('resize', () => {
    const axis = panelAxis();
    const lim = PANEL_LIMITS[axis];
    if (document.documentElement.style.getPropertyValue(lim.prop)) setPanelSize(axis, currentPanelSize(axis));
  });

  let drag = null;
  let frame = 0;
  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const axis = panelAxis();
    drag = { axis, moved: false, rect: document.getElementById('shell').getBoundingClientRect() };
    handle.setPointerCapture(e.pointerId);
    document.body.classList.add('is-resizing');
    e.preventDefault();
  });
  handle.addEventListener('pointermove', (e) => {
    if (!drag) return;
    drag.moved = true;
    const next = drag.axis === 'w' ? drag.rect.right - e.clientX : drag.rect.bottom - e.clientY;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drag && setPanelSize(drag.axis, next));
  });
  const end = (e) => {
    if (!drag) return;
    cancelAnimationFrame(frame);
    const { axis, moved } = drag;
    drag = null;
    document.body.classList.remove('is-resizing');
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    // A plain click must not freeze the default size
    if (moved) setPanelSize(axis, currentPanelSize(axis), true);
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);

  handle.addEventListener('dblclick', () => resetPanelSize(panelAxis()));

  handle.addEventListener('keydown', (e) => {
    const axis = panelAxis();
    // Dragging the edge left/up grows the panel, so the arrows follow that direction
    const grow = axis === 'w' ? 'ArrowLeft' : 'ArrowUp';
    const shrink = axis === 'w' ? 'ArrowRight' : 'ArrowDown';
    const step = e.shiftKey ? 96 : 24;
    let next = null;
    if (e.key === grow) next = currentPanelSize(axis) + step;
    else if (e.key === shrink) next = currentPanelSize(axis) - step;
    else if (e.key === 'Home') next = PANEL_LIMITS[axis].min;
    else if (e.key === 'End') next = panelMax(axis);
    else if (e.key === 'Enter') { resetPanelSize(axis); e.preventDefault(); return; }
    if (next == null) return;
    e.preventDefault();
    setPanelSize(axis, next, true);
  });
}

/**
 * Main Application Bootstrap
 */
function initApp() {
  lucide.createIcons();
  initMap();
  initSearch();
  initCoordinateModal();
  initFilterModal();
  initBasemapModal();
  initExcelModal();
  initMitra();
  initSampel();
  initModalBackdrops();
  initClipboardActions();
  initTheme();
  initPanelResizer();

  // Controls event listeners
  DOM.btnGps.addEventListener('click', handleGeolocation);
  DOM.btnHome.addEventListener('click', handleHomeButton);
  DOM.btnZoomIn.addEventListener('click', () => state.map.zoomIn());
  DOM.btnZoomOut.addEventListener('click', () => state.map.zoomOut());

  // The map is a flex item: whenever the panel or top bar changes size, the map re-measures itself
  if (window.ResizeObserver) {
    new ResizeObserver(() => state.map && state.map.invalidateSize()).observe(document.getElementById('mapArea'));
  }

  // Load geojson data
  loadGeoJsonData();

  // Service Worker
  registerServiceWorker();
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
