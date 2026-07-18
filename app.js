(() => {
  const DATA = window.CREATIVE_DATA;
  const root = 'video-production';
  const state = { idea: 0, car: 0, location: 0, video: 0, gallery: [], galleryIndex: 0 };
  const PROMPT_DIRECTIONS = [
    { scene: 'The car crosses a monumental cable-stayed bridge while the engineering structure gradually opens around it.', start: 'Low front three-quarter view from 25–35 cm. The car moves from structural shadow into light, with the nearest front wheel dominating the perspective.', end: 'High rear follow. The car continues in the left lane while the bridge pylons and cable geometry fully open ahead.', camera: 'Low parallel rolling shot beside the front fender, followed by a smooth camera rise and a slight drift behind the car.' },
    { scene: 'The car moves confidently through a long open bend among northern Thai hills and agricultural slopes.', start: 'Low front three-quarter view at the entrance to a long curve, keeping the open mountain landscape visible above the road.', end: 'High rear three-quarter after the curve, revealing rolling hills, farmland and the distant horizon behind the car.', camera: 'Stable side-front tracking with a gradual rise toward a rear three-quarter view.' },
    { scene: 'The car follows a wide coastal road while the sea and tropical hillside open beyond the outside of the bend.', start: 'Rear three-quarter at the entrance to a coastal curve, with the sea appearing between roadside greenery and the guardrail.', end: 'Parallel side profile with the sea and tropical terrain filling the background.', camera: 'Smooth rear-side chase that transitions into a parallel side rolling shot.' },
    { scene: 'A contemporary car moves calmly through a colorful historic street lined with Sino-Portuguese façades.', start: 'Front three-quarter at the entrance to the street, contrasting the car with colorful façades, arcades and traditional shutters.', end: 'Low side-rear profile moving past a continuous row of historic buildings.', camera: 'Slow parallel rolling shot at body height, moving visually from the front of the car toward the rear.' },
    { scene: 'The car travels along Bangkok Chinatown’s main road through dense architecture, signs and layered night light.', start: 'Very low close front three-quarter: headlight, intake and front wheel are prominent while the street perspective remains readable behind.', end: 'Wide rear three-quarter as the car continues into a dense field of real city lights.', camera: 'Begin close to the front fender, smoothly widen into a parallel view, then drift toward the rear.' },
    { scene: 'A fast urban passage along a Bangkok elevated expressway at night, grounded in real road lighting rather than fantasy neon.', start: 'Low front three-quarter almost at wheel height as the car emerges beneath warm expressway lights.', end: 'Low rear three-quarter with the camera falling slightly behind while the skyline and elevated road open in depth.', camera: 'Fast, stable rolling movement along the body from the front wheel toward the rear wheel.' },
    { scene: 'The car travels along a quiet rural Thai road through fields, palms and small villages.', start: 'High front three-quarter on an open stretch of road with fields and roadside greenery visible on both sides.', end: 'Wide rear three-quarter as the car continues along a straight road toward a small village.', camera: 'Smooth crane-down from a high front three-quarter into a parallel profile, followed by a slight drift behind.' },
    { scene: 'A calm VIP arrival beneath a long luxury-hotel canopy, focused on status, architecture and controlled reflections.', start: 'Front three-quarter approaching beneath the canopy, with the body reflecting warm architectural light.', end: 'Formal side profile as the car comes to a smooth stop at the entrance.', camera: 'Slow backward tracking in front of the car, transitioning gently into a clean side profile.' },
    { scene: 'The car moves through modern business-district Bangkok beneath elevated transit, with towers held in the background.', start: 'Low frontal rolling shot beneath urban infrastructure, with the car traveling in the left lane.', end: 'Rear follow slightly above roof height as the car continues toward a city intersection.', camera: 'Low parallel rolling movement that gradually falls back into a rear follow.' },
    { scene: 'Calm grand touring along a damp road enclosed by a dense green corridor.', start: 'Low rear close-up with the rear light signature reflected in the damp asphalt.', end: 'High side-rear wide shot as the car follows a gentle curve through deep greenery.', camera: 'Begin close behind the car, then widen and rise into a broad rear three-quarter view.' },
    { scene: 'The car moves calmly along an open road framed by monumental limestone cliffs and palms.', start: 'Low front three-quarter on a straight road, with a vertical limestone cliff rising above palms in the distance.', end: 'Wide rear three-quarter as the road continues between fields, palms and karst walls.', camera: 'Slow side-front tracking that smoothly expands into a wide rear three-quarter landscape view.' },
    { scene: 'The car travels along a long straight road between white salt piles and reflective salt pans.', start: 'Low front three-quarter with the geometric salt fields opening on both sides of the road.', end: 'Wide rear three-quarter toward the open horizon, with the road symmetrically dividing the reflective planes.', camera: 'Weighty tracking beside the front fender, gradually widening and rising into a rear landscape shot.' }
  ];
  const $ = (selector) => document.querySelector(selector);
  const pad = (value) => String(value).padStart(2, '0');
  const path = (value) => encodeURI(value);

  const elements = {
    draftList: $('#draft-list'), carSelect: $('#car-select'), locationSelect: $('#location-select'), videoSelect: $('#video-select'),
    ideaHero: $('#idea-hero'), sceneGrid: $('#scene-grid'), carGallery: $('#car-gallery'), locationGallery: $('#location-gallery'),
    carGalleryTitle: $('#car-gallery-title'), locationGalleryTitle: $('#location-gallery-title'), videoWorkbench: $('#video-workbench'), videoStrip: $('#video-strip'),
    prompt: $('#prompt-text'), negative: $('#negative-text'), selectionSummary: $('#selection-summary'), toast: $('#toast'),
    library: $('#library-dialog'), libraryTitle: $('#library-title'), libraryGrid: $('#library-grid'), lightbox: $('#lightbox'), lightboxImage: $('#lightbox-image'),
    lightboxCaption: $('#lightbox-caption'), lightboxDownload: $('#lightbox-download'), sidebar: $('#sidebar')
  };

  function carImage(car, index) { return path(`${root}/cars/${car.folder}/${car.slug}-${pad(index)}.jpg`); }
  function locationImage(location, index) { return path(`${root}/location-references/${location.slug}/${location.slug}-${pad(index)}.jpg`); }
  function videoPath(video) { return path(`${root}/camera-references/porsche/${video.file}`); }
  function carZip(car) { return path(`downloads/cars/${car.slug}.zip`); }
  function locationZip(location) { return path(`downloads/locations/${location.slug}.zip`); }

  function populateSelect(select, items) {
    select.innerHTML = items.map((item, index) => `<option value="${index}">${item.id} — ${item.name}</option>`).join('');
  }

  function personalizeScene(text, carName) {
    if (text.startsWith('Современный автомобиль')) return text.replace('Современный автомобиль', carName);
    if (text.startsWith('Автомобиль')) return text.replace('Автомобиль', carName);
    return `${carName}: ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  }

  function buildScenario() {
    const base = DATA.ideas[state.location] || DATA.ideas[state.idea];
    const car = DATA.cars[state.car];
    const location = DATA.locations[state.location];
    const video = DATA.videos[state.video];
    const scene = personalizeScene(base.scene, car.name);
    const full = `Восьмисекундный премиальный автомобильный ролик показывает ${car.name} в локации «${location.name}». ${scene} Ролик начинается следующим кадром: ${base.start} Затем камера отрабатывает движение: ${base.camera} Финал ролика: ${base.end} В конструкторе к этой сцене приложен видеореференс ${video.name}. ${video.description}`;
    return { ...base, title: `${base.title} — ${car.name}`, scene, full };
  }

  function renderDraftList() {
    elements.draftList.innerHTML = DATA.ideas.map((idea, index) => `
      <button class="draft-item ${index === state.idea ? 'is-active' : ''}" data-idea="${index}">
        <span class="draft-number">${idea.id}</span><span><strong>${idea.title}</strong><small>${idea.original}</small></span>
      </button>`).join('');
  }

  function renderIdea() {
    const idea = buildScenario();
    const car = DATA.cars[state.car];
    const location = DATA.locations[state.location];
    const video = DATA.videos[state.video];
    elements.ideaHero.innerHTML = `
      <div class="idea-copy"><span class="idea-index">СЦЕНАРИЙ ${idea.id} / 12</span><h2>${idea.title}</h2><p>${idea.scene}</p><div class="original-combination">Текущая комбинация: ${car.name} × ${location.name} × ${video.name}</div></div>
      <div class="idea-covers">
        <div class="cover-card"><img src="${carImage(car, 1)}" alt="${car.name}" /><span><small>Выбранный автомобиль</small>${car.name}</span></div>
        <div class="cover-card"><img src="${locationImage(location, 1)}" alt="${location.name}" /><span><small>Выбранная локация</small>${location.name}</span></div>
      </div>`;
    elements.sceneGrid.innerHTML = [
      ['00', 'Полное описание ролика', idea.full, 'scene-card--full'],
      ['01', 'Первый кадр (START)', idea.start, ''],
      ['02', 'Последний кадр (END)', idea.end, ''],
      ['03', 'Движение камеры', idea.camera, ''],
      ['04', 'Черновой сюжет', idea.scene, '']
    ].map(([n, title, body, className]) => `<article class="scene-card ${className}"><span>${n}</span><h3>${title}</h3><p>${body}</p><button type="button" class="scene-copy-button">Скопировать текст</button></article>`).join('');
  }

  function renderGallery(container, entries, kind) {
    container.innerHTML = entries.map((entry, index) => `
      <article class="reference-card">
        <button data-lightbox-index="${index}"><img src="${entry.src}" alt="${entry.label}" loading="lazy" /></button>
        <div><span>Фото ${pad(index + 1)}</span><a href="${entry.src}" download title="Скачать это изображение">Скачать JPG</a></div>
      </article>`).join('');
    container.onclick = (event) => {
      const button = event.target.closest('[data-lightbox-index]');
      if (!button) return;
      openLightbox(entries, Number(button.dataset.lightboxIndex));
    };
  }

  function renderAssets() {
    const car = DATA.cars[state.car];
    const location = DATA.locations[state.location];
    const carEntries = Array.from({ length: car.count }, (_, i) => ({ src: carImage(car, i + 1), label: `${car.name} · фотография ${pad(i + 1)}` }));
    const locationEntries = Array.from({ length: location.count }, (_, i) => ({ src: locationImage(location, i + 1), label: `${location.name} · фотография ${pad(i + 1)}` }));
    elements.carGalleryTitle.textContent = `${car.name} · ${car.count} фотографий`;
    elements.locationGalleryTitle.textContent = `${location.name} · ${location.count} фотографий`;
    renderGallery(elements.carGallery, carEntries, 'car');
    renderGallery(elements.locationGallery, locationEntries, 'location');
    setDownload('#download-car', carZip(car), `Скачать весь пакет автомобиля · ${car.count} фото · ZIP`);
    setDownload('#download-location', locationZip(location), `Скачать весь пакет локации · ${location.count} фото · ZIP`);
    setDownload('#dock-car-download', carZip(car), `Скачать пакет автомобиля · ${car.count} фото · ZIP`);
    setDownload('#dock-location-download', locationZip(location), `Скачать пакет локации · ${location.count} фото · ZIP`);
  }

  function setDownload(selector, href, label) { const link = $(selector); link.href = href; link.textContent = label; }

  function renderVideo() {
    const video = DATA.videos[state.video];
    elements.videoWorkbench.innerHTML = `
      <div class="video-frame"><video controls muted playsinline preload="metadata" src="${videoPath(video)}"></video></div>
      <div class="video-description">
        <span class="video-index">ВИДЕОРЕФЕРЕНС ${video.id} / 07</span>
        <h3>${video.name}</h3>
        <div class="video-description-text">${video.description}</div>
        <div class="tag-row">${video.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
        <div class="video-description-actions">
          <button type="button" class="video-copy-button" data-copy-video-description>Скопировать описание</button>
          <a href="${videoPath(video)}" download>Скачать видеореференс · MP4</a>
        </div>
      </div>`;
    elements.videoStrip.innerHTML = DATA.videos.map((item, index) => `<button class="video-chip ${index === state.video ? 'is-active' : ''}" data-video="${index}"><span>${item.id}</span><strong>${item.name}</strong><small>${item.meta}</small></button>`).join('');
    setDownload('#dock-video-download', videoPath(video), `Скачать ${video.name} · MP4`);
  }

  function generatePrompt() {
    const car = DATA.cars[state.car];
    const location = DATA.locations[state.location];
    const video = DATA.videos[state.video];
    const idea = buildScenario();
    return `Используй загруженные изображения первого и последнего кадров как фиксированные начальную и конечную точки одного непрерывного кинематографичного автомобильного ролика.

ФОРМАТ
Длительность: 8 секунд. 25 кадров/с. Фотореализм, премиальное рекламное качество, естественная физика движения.

АВТОМОБИЛЬ
В кадре должен оставаться точный ${car.name}, соответствующий загруженным фотографиям автомобиля. На протяжении всего ролика сохраняй без изменений: ${car.lock}.

ЛОКАЦИЯ
Сцена происходит в следующем окружении: ${location.environment}. Сохраняй пространственную узнаваемость, геометрию дороги, архитектуру и природные особенности, показанные на загруженных фотографиях локации.

ЧЕРНОВАЯ ИДЕЯ СЦЕНЫ
${idea.scene}

ПЕРВЫЙ КАДР (START)
${idea.start}

ПОСЛЕДНИЙ КАДР (END)
${idea.end}

ДВИЖЕНИЕ КАМЕРЫ
${idea.camera}

ВИДЕОРЕФЕРЕНС КАМЕРЫ И МОНТАЖА — ${video.name}
Используй выбранный референс как основу операторского языка, композиции, последовательности планов, монтажного ритма, переходов, света и характера движения камеры. Переноси только кинематографические приёмы: автомобиль и окружение должны оставаться выбранными выше.

${video.description}

Сохраняй связное движение вперёд, стабильную геометрию колёс, правдоподобную работу подвески, контролируемое размытие движения и последовательные отражения. Автомобиль должен оставаться узнаваемым и пропорционально одинаковым от первого до последнего кадра. В Таиланде левостороннее движение. Без звука.`;
  }

  function generateNegative() {
    const car = DATA.cars[state.car];
    return `Не менять идентичность автомобиля: ${car.lock}. Исключить деформацию кузова и колёс, дублирование деталей, нестабильный свет, случайные спойлеры, смену цвета, типа крыши или поколения модели. Исключить вымышленные дорожные знаки, европейскую организацию движения, правостороннее движение, деформированную разметку, искажённых людей и мотоциклы, парящие объекты, фантазийный неоновый город, чрезмерную скорость, дрожание камеры, мерцание между кадрами, резкие перепады экспозиции и непоследовательную погоду.`;
  }

  function renderPrompt() {
    const car = DATA.cars[state.car];
    const location = DATA.locations[state.location];
    const idea = buildScenario();
    const video = DATA.videos[state.video];
    elements.selectionSummary.innerHTML = `<span>${car.name}</span><b>+</b><span>${location.name}</span><b>+</b><span>${idea.title}</span><b>+</b><span>${video.name}</span>`;
    elements.prompt.value = generatePrompt();
    elements.negative.value = generateNegative();
  }

  function renderAll() {
    renderDraftList(); renderIdea(); renderAssets(); renderVideo(); renderPrompt();
    elements.carSelect.value = state.car; elements.locationSelect.value = state.location; elements.videoSelect.value = state.video;
    updateHash();
  }

  function selectIdea(index, sync = true) {
    state.idea = index;
    if (sync) { state.car = DATA.ideas[index].car; state.location = DATA.ideas[index].location; }
    renderAll();
    elements.sidebar.classList.remove('is-open');
    $('#workspace').scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateHash() {
    const hash = `idea=${DATA.ideas[state.idea].id}&car=${DATA.cars[state.car].id}&location=${DATA.locations[state.location].id}&ref=${DATA.videos[state.video].id}`;
    history.replaceState(null, '', `#${hash}`);
  }

  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    [['idea', DATA.ideas], ['car', DATA.cars], ['location', DATA.locations], ['ref', DATA.videos]].forEach(([key, list]) => {
      const found = list.findIndex(item => item.id === params.get(key));
      if (found >= 0) state[key === 'ref' ? 'video' : key] = found;
    });
  }

  function openLightbox(entries, index) { state.gallery = entries; state.galleryIndex = index; updateLightbox(); elements.lightbox.showModal(); }
  function updateLightbox() { const entry = state.gallery[state.galleryIndex]; elements.lightboxImage.src = entry.src; elements.lightboxImage.alt = entry.label; elements.lightboxCaption.textContent = `${entry.label} · ${state.galleryIndex + 1}/${state.gallery.length}`; elements.lightboxDownload.href = entry.src; }
  function moveLightbox(delta) { state.galleryIndex = (state.galleryIndex + delta + state.gallery.length) % state.gallery.length; updateLightbox(); }

  function showToast(message) { elements.toast.textContent = message; elements.toast.classList.add('is-visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => elements.toast.classList.remove('is-visible'), 1800); }
  async function copyText(text, message) {
    try { await navigator.clipboard.writeText(text); }
    catch { const helper = document.createElement('textarea'); helper.value = text; document.body.append(helper); helper.select(); document.execCommand('copy'); helper.remove(); }
    showToast(message);
  }

  function openLibrary(type) {
    const configs = {
      cars: { title: 'Все автомобили', items: DATA.cars, image: item => carImage(item, 1), meta: item => `${item.meta} · ${item.count} фото`, download: item => carZip(item), downloadLabel: item => `Скачать весь пакет · ${item.count} фото · ZIP` },
      locations: { title: 'Все локации', items: DATA.locations, image: item => locationImage(item, 1), meta: item => `${item.meta} · ${item.count} фото`, download: item => locationZip(item), downloadLabel: item => `Скачать весь пакет · ${item.count} фото · ZIP` },
      videos: { title: 'Все видеореференсы Porsche', items: DATA.videos, video: item => videoPath(item), meta: item => item.meta, download: item => videoPath(item), downloadLabel: () => 'Скачать видеореференс · MP4' }
    };
    const config = configs[type];
    elements.libraryTitle.textContent = config.title;
    elements.libraryGrid.innerHTML = config.items.map((item, index) => `
      <article class="library-card" data-library-type="${type}" data-library-index="${index}">
        <button type="button" class="library-card-select">
          ${config.video ? `<video src="${config.video(item)}" muted preload="metadata"></video>` : `<img src="${config.image(item)}" alt="${item.name}" loading="lazy" />`}
          <span><small>${item.id}</small><strong>${item.name}</strong><em>${config.meta(item)}</em></span>
        </button>
        <a class="library-card-download" data-library-download href="${config.download(item)}" download>${config.downloadLabel(item)}</a>
      </article>`).join('');
    elements.library.showModal();
  }

  populateSelect(elements.carSelect, DATA.cars); populateSelect(elements.locationSelect, DATA.locations); populateSelect(elements.videoSelect, DATA.videos);
  readHash(); state.idea = state.location; renderAll();

  elements.draftList.addEventListener('click', (e) => { const button = e.target.closest('[data-idea]'); if (button) selectIdea(Number(button.dataset.idea)); });
  elements.carSelect.addEventListener('change', (e) => { state.car = Number(e.target.value); renderAll(); });
  elements.locationSelect.addEventListener('change', (e) => { state.location = Number(e.target.value); state.idea = state.location; renderAll(); });
  elements.videoSelect.addEventListener('change', (e) => { state.video = Number(e.target.value); renderAll(); });
  elements.videoStrip.addEventListener('click', (e) => { const button = e.target.closest('[data-video]'); if (button) { state.video = Number(button.dataset.video); renderAll(); } });
  elements.videoWorkbench.addEventListener('click', (e) => { const button = e.target.closest('[data-copy-video-description]'); if (button) copyText(DATA.videos[state.video].description, 'Описание видеореференса скопировано'); });
  $('#reset-combination').addEventListener('click', () => selectIdea(state.idea, true));
  document.addEventListener('click', (e) => { const trigger = e.target.closest('[data-library]'); if (trigger) openLibrary(trigger.dataset.library); });
  elements.libraryGrid.addEventListener('click', (e) => { if (e.target.closest('[data-library-download]')) return; const card = e.target.closest('[data-library-index]'); if (!card) return; const index = Number(card.dataset.libraryIndex); if (card.dataset.libraryType === 'cars') state.car = index; if (card.dataset.libraryType === 'locations') { state.location = index; state.idea = index; } if (card.dataset.libraryType === 'videos') state.video = index; elements.library.close(); renderAll(); });
  elements.sceneGrid.addEventListener('click', (e) => { const button = e.target.closest('.scene-copy-button'); if (!button) return; const text = button.closest('.scene-card').querySelector('p').textContent; copyText(text, 'Текст блока скопирован'); });
  $('#library-close').addEventListener('click', () => elements.library.close());
  $('#lightbox-close').addEventListener('click', () => elements.lightbox.close());
  $('#lightbox-prev').addEventListener('click', () => moveLightbox(-1)); $('#lightbox-next').addEventListener('click', () => moveLightbox(1));
  $('#copy-prompt').addEventListener('click', () => copyText(elements.prompt.value, 'Промт скопирован'));
  $('#copy-negative').addEventListener('click', () => copyText(elements.negative.value, 'Ограничения скопированы'));
  $('#copy-all').addEventListener('click', () => copyText(`${elements.prompt.value}\n\nОГРАНИЧЕНИЯ / НЕГАТИВНЫЙ ПРОМТ\n${elements.negative.value}`, 'Промт и ограничения скопированы'));
  $('#sidebar-toggle').addEventListener('click', () => elements.sidebar.classList.add('is-open')); $('#sidebar-close').addEventListener('click', () => elements.sidebar.classList.remove('is-open'));
  document.addEventListener('keydown', (e) => { if (!elements.lightbox.open) return; if (e.key === 'ArrowLeft') moveLightbox(-1); if (e.key === 'ArrowRight') moveLightbox(1); });
})();
