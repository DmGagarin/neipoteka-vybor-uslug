const serviceCards = document.querySelectorAll('.service-card');
const contractCard = document.querySelector('[data-contract="true"]');
const prerequisiteCards = [...serviceCards].filter((card) => card !== contractCard);
const modalOverlay = document.querySelector('[data-modal-overlay]');
const modalIllustration = modalOverlay?.querySelector('[data-modal-illustration]');
const modalClose = modalOverlay?.querySelector('.modal-close');
const modalOk = modalOverlay?.querySelector('.modal-ok');
const modalTitle = modalOverlay?.querySelector('[data-modal-title]');
const modalCopy = modalOverlay?.querySelector('[data-modal-copy]');
const dealTime = document.querySelector('[data-deal-time]');
const dealInfo = document.querySelector('.deal-info');
const serviceFlow = document.querySelector('.service-flow');
const feeSwitchRow = document.querySelector('[data-fee-switch-row]');
const priceIcon = document.querySelector('[data-price-icon]');
const priceLabel = document.querySelector('[data-price-label]');
const totalPrice = document.querySelector('[data-total-price]');
const totalUp = document.querySelector('[data-total-up]');
const upInfoTrigger = document.querySelector('[data-up-info-trigger]');
const upHint = document.querySelector('[data-up-hint]');
const upHintContent = document.querySelector('[data-up-hint-content]');
const upHintClose = upHint?.querySelector('.up-hint__close');
const feeHint = document.querySelector('[data-fee-hint]');
const feeHintTrigger = document.querySelector('[data-fee-hint-trigger]');
const feeHintClose = feeHint?.querySelector('[data-fee-hint-close]');
const switchButton = document.querySelector('.switch');
const continueButton = document.querySelector('[data-continue]');
const promoModalOverlay = document.querySelector('[data-promo-modal-overlay]');
const promoModalClose = promoModalOverlay?.querySelector('[data-promo-close]');
const promoModalSkip = promoModalOverlay?.querySelector('[data-promo-skip]');
const promoModalAccept = promoModalOverlay?.querySelector('[data-promo-accept]');
const promoFeeSwitch = promoModalOverlay?.querySelector('[data-promo-fee-switch]');
const promoPriceLabel = promoModalOverlay?.querySelector('[data-promo-price-label]');
const promoPrice = promoModalOverlay?.querySelector('[data-promo-price]');
const registrationCard = document.querySelector('[data-service="registration"]');
const creditCard = document.querySelector('[data-service="credit"]');

const digitPattern = /\d/;

function getDigitKeys(value) {
  const keys = new Array(value.length).fill(-1);
  let fromRight = 0;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    if (digitPattern.test(value[index])) {
      keys[index] = fromRight;
      fromRight += 1;
    }
  }

  return keys;
}

function renderRollingValue(element, nextValue) {
  if (!element) return;

  const hasPreviousValue = Boolean(element.dataset.rollingValue);
  const previousValue = element.dataset.rollingValue ?? element.textContent;
  const sameValue = previousValue.replace(/\s/g, ' ') === nextValue.replace(/\s/g, ' ');
  if (hasPreviousValue && sameValue) return;

  const previousDigits = [...previousValue].filter((char) => digitPattern.test(char));
  const nextKeys = getDigitKeys(nextValue);
  const oldDigitsByKey = new Map(previousDigits.slice().reverse().map((char, index) => [index, char]));
  const renderId = String((Number(element.dataset.rollingRenderId) || 0) + 1);
  element.dataset.rollingRenderId = renderId;
  const nodes = [];

  [...nextValue].forEach((char, index) => {
    if (!digitPattern.test(char)) {
      nodes.push(document.createTextNode(char));
      return;
    }

    const oldChar = oldDigitsByKey.get(nextKeys[index]);
    const cell = document.createElement('span');
    cell.className = 'rolling-digit';

    if (!hasPreviousValue || !oldChar || oldChar === char) {
      cell.textContent = char;
      nodes.push(cell);
      return;
    }

    const isMovingUp = Number(char) > Number(oldChar);
    const track = document.createElement('span');
    cell.classList.add('rolling-digit--animating');
    track.className = `rolling-digit__track rolling-digit__track--${isMovingUp ? 'up' : 'down'}`;
    track.style.setProperty('--rolling-delay', `${Math.min(nextKeys[index] * 18, 90)}ms`);

    const incoming = document.createElement('span');
    incoming.className = 'rolling-digit__item';
    incoming.textContent = char;
    const outgoing = document.createElement('span');
    outgoing.className = 'rolling-digit__item';
    outgoing.textContent = oldChar;

    if (isMovingUp) track.append(outgoing, incoming);
    else track.append(incoming, outgoing);

    track.addEventListener('animationend', () => {
      if (element.dataset.rollingRenderId === renderId) {
        cell.textContent = char;
        cell.classList.remove('rolling-digit--animating');
      }
    }, { once: true });

    cell.append(track);
    requestAnimationFrame(() => requestAnimationFrame(() => track.classList.add('is-rolling')));
    nodes.push(cell);
  });

  element.classList.add('rolling-value');
  element.replaceChildren(...nodes);
  element.dataset.rollingValue = nextValue;
}

const modalIllustrations = {
  electronic: '/src/assets/modal-electronic.png',
  credit: '/src/assets/modal-contract.png',
  contract: '/src/assets/modal-credit.png',
};
const modalContent = {
  electronic: {
    title: 'Расскажите клиентам об услуге «Электронная регистрация»',
    paragraphs: [
      'Для покупки недвижимости нужно зарегистрировать переход права собственности в Росреестре. Предлагаю сделать это в электронном виде.',
      'Так вам не придётся несколько раз посещать МФЦ: документы мы отправим на регистрацию сразу после подписания в офисе банка, а зарегистрированные документы пришлём в личный кабинет Домклик.',
      'Регистрация занимает в среднем около 3 рабочих дней, а её статус можете отслеживать онлайн в кабинете.',
    ],
  },
  credit: {
    title: 'Расскажите клиентам об услуге «Аккредитив»',
    paragraphs: [
      'Для безопасных расчётов с продавцом можно оформить аккредитив.',
      'Банк сохранит деньги и переведёт их продавцу только после выполнения условий сделки. Это помогает защитить интересы обеих сторон.',
      'Как только банк получит информацию о регистрации сделки в Росреестре, аккредитив раскроется автоматически.',
    ],
  },
  contract: {
    title: 'Расскажите клиентам об услуге «Договор купли-продажи»',
    paragraphs: [
      'Для сделки понадобится договор купли-продажи. Важно, чтобы он учитывал все условия сделки и соответствовал требованиям законодательства.',
      'Мы подготовим договор с учётом интересов всех участников. Договор от Домклик минимизирует риски и обеспечивает безопасность сделки.',
      'В стоимость услуги также входят акт приёма-передачи и расписка.',
    ],
  },
};

function syncContractState() {
  const hasPrerequisite = prerequisiteCards.some((card) => card.dataset.selected === 'true');
  const isDisabled = !hasPrerequisite;

  if (isDisabled && contractCard?.dataset.selected === 'true') {
    contractCard.dataset.selected = 'false';
    contractCard.classList.remove('service-card--selected');
  }

  if (contractCard) {
    contractCard.dataset.disabled = String(isDisabled);
    contractCard.setAttribute('aria-disabled', String(isDisabled));
  }
}

function updateDealTime() {
  const selectedServices = [...serviceCards].filter((card) => card.dataset.selected === 'true');
  const key = selectedServices.map((card) => card.dataset.service).join('+');

  const noServices = selectedServices.length === 0;
  dealInfo?.classList.toggle('deal-info--hidden', noServices);
  serviceFlow?.classList.toggle('service-flow--compact', noServices);
  updatePriceSummary();
  updateUpSummary(selectedServices);
  if (!dealTime) return;

  const times = {
    credit: '~21 минуты',
    'credit+contract': '~44 минуты',
    'registration+contract': '~47 минут',
    'registration+credit+contract': '~62 минуты',
    registration: '~33 минуты',
    'registration+credit': '~54 минуты',
  };

  renderRollingValue(dealTime, times[key] || '~0 минут');
}

function updateUpSummary(selectedServices) {
  if (!totalUp) return;

  const upHundredths = selectedServices.reduce((sum, card) => sum + ({
    registration: 61,
    credit: 86,
    contract: 20,
  }[card.dataset.service] || 0), 0);

  renderRollingValue(totalUp, `До ${(upHundredths / 100).toFixed(2).replace('.', ',')}`);
  renderUpHint(selectedServices);
}

function renderUpHint(selectedServices) {
  if (!upHintContent) return;

  const breakdowns = {
    registration: {
      title: 'Электронная регистрация',
      lines: ['Привлечение — 0,08', 'Оформение — 0,53'],
    },
    credit: {
      title: 'Аккредитив Домклик',
      lines: ['Привлечение – 0,35', 'Оформление – 0,40', 'Подтверждение в СБОЛ.про — 0,11'],
    },
    contract: {
      title: 'Договор купли продажи',
      lines: ['Оформление — 0,20'],
    },
  };

  upHintContent.replaceChildren(...selectedServices.map((card) => breakdowns[card.dataset.service]).filter(Boolean).map((block) => {
    const element = document.createElement('div');
    element.className = 'up-hint__block';
    const title = document.createElement('strong');
    title.textContent = block.title;
    const lines = document.createElement('span');
    lines.innerHTML = block.lines.join('<br>');
    element.append(title, lines);
    return element;
  }));
}

function updatePriceSummary() {
  const selectedServices = [...serviceCards].filter((card) => card.dataset.selected === 'true');
  const hasRegistration = selectedServices.some((card) => card.dataset.service === 'registration');
  const basePrice = selectedServices.reduce((sum, card) => sum + ({
    registration: 6600,
    credit: 3400,
    contract: 3900,
  }[card.dataset.service] || 0), 0);

  if (!hasRegistration && switchButton?.getAttribute('aria-pressed') === 'true') {
    switchButton.setAttribute('aria-pressed', 'false');
    switchButton.classList.remove('switch--on');
  }

  const withFee = hasRegistration && switchButton?.getAttribute('aria-pressed') === 'true';
  feeSwitchRow?.classList.toggle('deal-card__switch--hidden', !hasRegistration);
  feeSwitchRow?.setAttribute('aria-hidden', String(!hasRegistration));
  priceIcon?.classList.toggle('deal-card__price-icon--visible', !hasRegistration);
  priceIcon?.setAttribute('aria-hidden', String(hasRegistration));
  if (switchButton) switchButton.disabled = !hasRegistration;
  if (priceLabel) priceLabel.textContent = withFee ? 'Цена услуг с госпошлиной' : hasRegistration ? 'Цена услуг без госпошлины' : 'Цена услуг';
  if (totalPrice) renderRollingValue(totalPrice, `${withFee ? 'от ' : ''}${new Intl.NumberFormat('ru-RU').format(basePrice + (withFee ? 4000 : 0))} ₽`);
}

serviceCards.forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('.script-link')) return;
    if (card.dataset.contract === 'true' && card.dataset.disabled === 'true') return;

    const selected = card.dataset.selected === 'true';
    card.dataset.selected = String(!selected);
    card.classList.toggle('service-card--selected', !selected);
    syncContractState();
    updateDealTime();
  });
});

syncContractState();
updateDealTime();

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.hidden = true;
  document.body.classList.remove('modal-open');
}

function shouldOfferRegistration() {
  return registrationCard?.dataset.selected !== 'true' && creditCard?.dataset.selected === 'true';
}

function closePromoModal() {
  if (!promoModalOverlay) return;
  promoModalOverlay.hidden = true;
  document.body.classList.remove('modal-open');
}

function updatePromoPrice() {
  const withFee = promoFeeSwitch?.getAttribute('aria-pressed') === 'true';
  if (promoPriceLabel) promoPriceLabel.textContent = withFee ? 'Цена услуги с госпошлиной' : 'Цена услуги';
  if (promoPrice) renderRollingValue(promoPrice, withFee ? 'от 10 600 ₽' : '6 600 ₽');
}

function resetPromoPrice() {
  promoFeeSwitch?.setAttribute('aria-pressed', 'false');
  promoFeeSwitch?.classList.remove('switch--on');
  if (promoPriceLabel) promoPriceLabel.textContent = 'Цена услуги';
  if (promoPrice) {
    promoPrice.textContent = '6 600 ₽';
    promoPrice.dataset.rollingValue = '6 600 ₽';
  }
}

function openPromoModal() {
  if (!promoModalOverlay) return;
  resetPromoPrice();
  promoModalOverlay.hidden = false;
  document.body.classList.add('modal-open');
  promoModalClose?.focus();
}

function openModal(type, event) {
  event.preventDefault();
  event.stopPropagation();

  const card = event.currentTarget.closest('.service-card');
  if (card?.dataset.disabled === 'true') return;

  if (modalIllustration && modalIllustrations[type]) {
    modalIllustration.src = modalIllustrations[type];
  }
  const content = modalContent[type];
  if (content && modalTitle && modalCopy) {
    modalTitle.textContent = content.title;
    modalCopy.replaceChildren(...content.paragraphs.map((paragraph) => {
      const element = document.createElement('p');
      element.textContent = paragraph;
      return element;
    }));
  }
  if (modalOverlay) {
    modalOverlay.querySelector('.deal-modal')?.classList.remove('deal-modal--electronic', 'deal-modal--contract');
    if (type !== 'credit') modalOverlay.querySelector('.deal-modal')?.classList.add(`deal-modal--${type}`);
    modalOverlay.hidden = false;
    document.body.classList.add('modal-open');
    modalClose?.focus();
  }
}

document.querySelectorAll('.script-link').forEach((link) => {
  link.addEventListener('click', (event) => openModal(link.dataset.modal, event));
  link.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') openModal(link.dataset.modal, event);
  });
});

continueButton?.addEventListener('click', () => {
  if (shouldOfferRegistration()) openPromoModal();
});

promoModalClose?.addEventListener('click', closePromoModal);
promoFeeSwitch?.addEventListener('click', (event) => {
  event.stopPropagation();
  const pressed = promoFeeSwitch.getAttribute('aria-pressed') === 'true';
  promoFeeSwitch.setAttribute('aria-pressed', String(!pressed));
  promoFeeSwitch.classList.toggle('switch--on', !pressed);
  updatePromoPrice();
});
promoModalAccept?.addEventListener('click', () => {
  if (registrationCard?.dataset.selected !== 'true') {
    registrationCard.dataset.selected = 'true';
    registrationCard.classList.add('service-card--selected');
    syncContractState();
    updateDealTime();
  }
  closePromoModal();
});
promoModalOverlay?.addEventListener('click', (event) => {
  if (event.target === promoModalOverlay) closePromoModal();
});

function positionFeeHint() {
  if (!feeHint || feeHint.hidden || !feeHintTrigger) return;

  const triggerRect = feeHintTrigger.getBoundingClientRect();
  const iconRect = feeHintTrigger.querySelector('img')?.getBoundingClientRect() || triggerRect;
  const viewportPadding = 16;
  const gap = 4;
  const width = Math.min(380, window.innerWidth - viewportPadding * 2);
  feeHint.style.width = `${width}px`;
  feeHint.style.left = '0px';
  feeHint.style.top = '0px';

  const surface = feeHint.querySelector('.fee-hint__surface');
  if (!surface) return;
  surface.style.maxHeight = `min(480px, calc(100vh - ${viewportPadding * 2}px))`;
  const panelHeight = surface.getBoundingClientRect().height;
  const fullHeight = panelHeight + 8;
  const spaceAbove = triggerRect.top - viewportPadding;
  const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding;
  const placement = fullHeight + gap <= spaceAbove ? 'top' : 'bottom';

  feeHint.dataset.placement = placement;
  if (placement === 'top') {
    feeHint.style.top = `${triggerRect.top - fullHeight - gap}px`;
  } else {
    surface.style.maxHeight = `${Math.max(160, Math.min(480, spaceBelow - gap - 8))}px`;
    feeHint.style.top = `${triggerRect.bottom + gap + 8}px`;
  }

  const actualWidth = feeHint.getBoundingClientRect().width;
  const left = Math.max(viewportPadding, Math.min(
    window.innerWidth - actualWidth - viewportPadding,
    triggerRect.right - actualWidth
  ));
  feeHint.style.left = `${left}px`;
  feeHint.style.setProperty('--fee-hint-arrow-left', `${iconRect.left + iconRect.width / 2 - left}px`);
}

function closeFeeHint(restoreFocus = false) {
  if (!feeHint || feeHint.hidden) return;
  feeHint.hidden = true;
  feeHintTrigger?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) feeHintTrigger?.focus();
}

function openFeeHint() {
  if (!feeHint || !feeHintTrigger) return;
  feeHint.hidden = false;
  feeHintTrigger.setAttribute('aria-expanded', 'true');
  positionFeeHint();
  feeHintClose?.focus();
}

feeHintTrigger?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (feeHint?.hidden) openFeeHint();
  else closeFeeHint();
});
feeHintTrigger?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  event.stopPropagation();
  if (feeHint?.hidden) openFeeHint();
  else closeFeeHint();
});
feeHintClose?.addEventListener('click', (event) => {
  event.stopPropagation();
  closeFeeHint(true);
});
window.addEventListener('resize', positionFeeHint);
document.addEventListener('scroll', positionFeeHint, true);

modalClose?.addEventListener('click', closeModal);
modalOk?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (event) => {
  if (event.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modalOverlay && !modalOverlay.hidden) closeModal();
  if (event.key === 'Escape' && promoModalOverlay && !promoModalOverlay.hidden) closePromoModal();
  if (event.key === 'Escape' && upHint && !upHint.hidden) closeUpHint();
  if (event.key === 'Escape' && feeHint && !feeHint.hidden) closeFeeHint(true);
});

function closeUpHint() {
  if (!upHint) return;
  upHint.hidden = true;
  upInfoTrigger?.setAttribute('aria-expanded', 'false');
}

upInfoTrigger?.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = !upHint.hidden;
  if (isOpen) closeUpHint();
  else {
    upHint.hidden = false;
    upInfoTrigger.setAttribute('aria-expanded', 'true');
    upHintClose?.focus();
  }
});
upHintClose?.addEventListener('click', closeUpHint);
document.addEventListener('click', (event) => {
  if (upHint && !upHint.hidden && !upHint.contains(event.target) && event.target !== upInfoTrigger) closeUpHint();
  if (feeHint && !feeHint.hidden && !feeHint.contains(event.target) && event.target !== feeHintTrigger) closeFeeHint();
});

switchButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  const pressed = switchButton.getAttribute('aria-pressed') === 'true';
  switchButton.setAttribute('aria-pressed', String(!pressed));
  switchButton.classList.toggle('switch--on', !pressed);
  updatePriceSummary();
});

