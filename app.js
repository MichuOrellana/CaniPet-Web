// app.js - CaniPet Intelligent Booking System

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- STATE ---
  const state = {
    service: 'grooming', // 'grooming' | 'vet'
    petName: '',
    petBreed: '',
    petWeight: 'Mediano (10 a 25 kg)',
    petAge: 'Adulto (1 a 7 años)',
    
    // Grooming details
    groomingService: 'Baño completo + Secado + Uñas',
    groomingKnots: 'Sin nudos',
    groomingTemp: 'Súper tranquilo',
    hasFleas: false,
    hasSensitiveSkin: false,

    // Vet details
    vetReason: 'Consulta clínica general',
    vetSymptoms: '',
    vetMeds: '',
    triageLevel: 'normal', // 'normal' | 'urgent'
    detectedUrgentKeywords: [],

    // Schedule & Contact
    timePreference: 'Turno Mañana (09:00 a 13:00 hs)',
    dayPreference: 'Lo antes posible (Hoy o Mañana)',
    needsTransport: false,
    ownerName: '',
    ownerPhone: '',
    notes: '',

    // Target WhatsApp (preconfigurado con tu número)
    targetPhone: (() => {
      const saved = localStorage.getItem('canipet_target_phone');
      return (saved && saved !== '5491100000000') ? saved : '5491160414571';
    })()
  };

  // --- CRITICAL EMERGENCY KEYWORDS FOR AI TRIAGE ---
  const URGENT_KEYWORDS = [
    'sangre', 'hemorragia', 'convulsion', 'convulsión', 'desmay', 'desvanecio', 'desvaneció',
    'no respira', 'ahogo', 'asfixia', 'veneno', 'intoxic', 'atropell', 'chocó', 'choco',
    'quebr', 'fractur', 'inconsciente', 'ojo salido', 'torsion', 'torsión', 'hueso trabado',
    'vomita sangre', 'diarrea con sangre', 'orina sangre', 'no puede orinar', 'dolor insoportable',
    'comio vidrio', 'comió vidrio', 'raticida', 'parálisis', 'paralisis', 'cianotico', 'morado'
  ];

  // --- DOM ELEMENTS ---
  const btnGrooming = document.getElementById('service-grooming-btn');
  const btnVet = document.getElementById('service-vet-btn');
  const sectionGrooming = document.getElementById('section-grooming');
  const sectionVet = document.getElementById('section-vet');
  const previewBadgeService = document.getElementById('preview-badge-service');
  const whatsappPreviewText = document.getElementById('whatsapp-preview-text');
  const btnSendWhatsapp = document.getElementById('btn-send-whatsapp');

  // Input Elements
  const inputPetName = document.getElementById('pet-name');
  const inputPetBreed = document.getElementById('pet-breed');
  const selectPetAge = document.getElementById('pet-age');
  const selectGroomingService = document.getElementById('grooming-service-type');
  const checkFleas = document.getElementById('check-fleas');
  const checkSkin = document.getElementById('check-skin');
  const selectVetReason = document.getElementById('vet-reason');
  const textareaVetSymptoms = document.getElementById('vet-symptoms');
  const inputVetMeds = document.getElementById('vet-meds');
  const selectTimePreference = document.getElementById('time-preference');
  const selectDayPreference = document.getElementById('day-preference');
  const checkTransport = document.getElementById('check-transport');
  const inputOwnerName = document.getElementById('owner-name');
  const inputOwnerPhone = document.getElementById('owner-phone');
  const inputNotes = document.getElementById('additional-notes');

  // AI Triage Box Elements
  const aiTriageBox = document.getElementById('ai-triage-box');
  const aiTriageTitle = document.getElementById('ai-triage-title');
  const aiTriageBadge = document.getElementById('ai-triage-badge');
  const aiTriageDesc = document.getElementById('ai-triage-desc');
  const aiTriageIcon = document.getElementById('ai-triage-icon');

  // Phone config modal elements
  const btnConfigPhone = document.getElementById('btn-config-phone');
  const modalPhone = document.getElementById('modal-phone');
  const closeModalPhone = document.getElementById('close-modal-phone');
  const btnSavePhone = document.getElementById('btn-save-phone');
  const inputTargetPhone = document.getElementById('input-target-phone');
  const displayPhone = document.getElementById('display-phone');

  // --- UPDATE PHONE DISPLAY ---
  function updatePhoneDisplay() {
    if (state.targetPhone) {
      if (state.targetPhone === '5491160414571') {
        displayPhone.textContent = '+54 9 11 6041-4571';
      } else {
        displayPhone.textContent = `+${state.targetPhone}`;
      }
    } else {
      displayPhone.textContent = '+54 9 11 6041-4571';
    }
  }
  updatePhoneDisplay();

  // --- SERVICE TOGGLER ---
  function setService(serviceType) {
    state.service = serviceType;
    if (serviceType === 'grooming') {
      // Grooming active
      btnGrooming.classList.remove('border-slate-200', 'bg-white');
      btnGrooming.classList.add('border-emerald-500', 'bg-emerald-50/50');
      btnGrooming.querySelector('.badge-selected').classList.remove('hidden');

      btnVet.classList.remove('border-emerald-500', 'bg-emerald-50/50');
      btnVet.classList.add('border-slate-200', 'bg-white');
      btnVet.querySelector('.badge-selected').classList.add('hidden');

      sectionGrooming.classList.remove('hidden');
      sectionVet.classList.add('hidden');
      previewBadgeService.textContent = '✂️ PELUQUERÍA CANINA';
    } else {
      // Vet active
      btnVet.classList.remove('border-slate-200', 'bg-white');
      btnVet.classList.add('border-emerald-500', 'bg-emerald-50/50');
      btnVet.querySelector('.badge-selected').classList.remove('hidden');

      btnGrooming.classList.remove('border-emerald-500', 'bg-emerald-50/50');
      btnGrooming.classList.add('border-slate-200', 'bg-white');
      btnGrooming.querySelector('.badge-selected').classList.add('hidden');

      sectionVet.classList.remove('hidden');
      sectionGrooming.classList.add('hidden');
      previewBadgeService.textContent = '🩺 ATENCIÓN VETERINARIA';
    }
    updateMessagePreview();
  }

  btnGrooming.addEventListener('click', () => setService('grooming'));
  btnVet.addEventListener('click', () => setService('vet'));

  // --- WEIGHT SELECTOR BUTTONS ---
  const weightButtons = document.querySelectorAll('.weight-card');
  weightButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      weightButtons.forEach(b => {
        b.classList.remove('active-weight', 'border-2', 'border-emerald-500', 'bg-emerald-50');
        b.classList.add('border-slate-200', 'bg-slate-50');
        const boldText = b.querySelector('.font-bold');
        if (boldText) boldText.className = 'font-bold text-slate-800';
      });
      btn.classList.add('active-weight', 'border-2', 'border-emerald-500', 'bg-emerald-50');
      btn.classList.remove('border-slate-200', 'bg-slate-50');
      const boldText = btn.querySelector('.font-bold');
      if (boldText) boldText.className = 'font-bold text-emerald-800';

      state.petWeight = btn.dataset.weight;
      updateMessagePreview();
    });
  });

  // --- KNOTS SELECTOR ---
  const knotButtons = document.querySelectorAll('.knot-card');
  knotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      knotButtons.forEach(b => {
        b.classList.remove('active-knot', 'border-2', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-800');
        b.classList.add('border-slate-200', 'bg-slate-50', 'text-slate-700');
      });
      btn.classList.add('active-knot', 'border-2', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-800');
      btn.classList.remove('border-slate-200', 'bg-slate-50', 'text-slate-700');
      state.groomingKnots = btn.dataset.knots;
      updateMessagePreview();
    });
  });

  // --- TEMPERAMENT SELECTOR ---
  const tempButtons = document.querySelectorAll('.temp-card');
  tempButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tempButtons.forEach(b => {
        b.classList.remove('active-temp', 'border-2', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-800');
        b.classList.add('border-slate-200', 'bg-slate-50', 'text-slate-700');
      });
      btn.classList.add('active-temp', 'border-2', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-800');
      btn.classList.remove('border-slate-200', 'bg-slate-50', 'text-slate-700');
      state.groomingTemp = btn.dataset.temp;
      updateMessagePreview();
    });
  });

  // --- AI TRIAGE SCANNER ---
  function scanTriage(symptomsText) {
    const textLower = (symptomsText || '').toLowerCase();
    const found = URGENT_KEYWORDS.filter(k => textLower.includes(k));

    if (found.length > 0) {
      state.triageLevel = 'urgent';
      state.detectedUrgentKeywords = found;

      aiTriageBox.className = 'p-3.5 rounded-xl border-2 border-red-500 bg-red-50 text-xs transition-all duration-300 triage-emergency-alert';
      aiTriageIcon.className = 'p-1 rounded-md bg-red-200 text-red-700 mt-0.5';
      aiTriageIcon.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4 text-red-600"></i>`;
      aiTriageTitle.className = 'font-bold text-red-900';
      aiTriageTitle.textContent = '🚨 ALERTA DE TRIAJE IA: Posible Urgencia Médica';
      aiTriageBadge.className = 'text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wider';
      aiTriageBadge.textContent = 'Prioridad Urgente';
      aiTriageDesc.className = 'text-red-800 mt-1 font-medium';
      aiTriageDesc.innerHTML = `Detectamos señales críticas: <em>"${found.slice(0, 3).join(', ')}"</em>. <strong>Recomendación:</strong> Acudí de inmediato a la guardia médica sin esperar confirmación de turno.`;
    } else {
      state.triageLevel = 'normal';
      state.detectedUrgentKeywords = [];

      aiTriageBox.className = 'p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs transition-all duration-300';
      aiTriageIcon.className = 'p-1 rounded-md bg-emerald-100 text-emerald-700 mt-0.5';
      aiTriageIcon.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 text-emerald-700"></i>`;
      aiTriageTitle.className = 'font-bold text-slate-800';
      aiTriageTitle.textContent = 'Triage IA: Caso programable';
      aiTriageBadge.className = 'text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded';
      aiTriageBadge.textContent = 'Prioridad Normal';
      aiTriageDesc.className = 'text-slate-600 mt-1';
      aiTriageDesc.textContent = 'Completá los datos para agendar el turno por WhatsApp según disponibilidad.';
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- LISTENERS FOR INPUTS ---
  inputPetName.addEventListener('input', (e) => { state.petName = e.target.value; updateMessagePreview(); });
  inputPetBreed.addEventListener('input', (e) => { state.petBreed = e.target.value; updateMessagePreview(); });
  selectPetAge.addEventListener('change', (e) => { state.petAge = e.target.value; updateMessagePreview(); });

  selectGroomingService.addEventListener('change', (e) => { state.groomingService = e.target.value; updateMessagePreview(); });
  checkFleas.addEventListener('change', (e) => { state.hasFleas = e.target.checked; updateMessagePreview(); });
  checkSkin.addEventListener('change', (e) => { state.hasSensitiveSkin = e.target.checked; updateMessagePreview(); });

  selectVetReason.addEventListener('change', (e) => { state.vetReason = e.target.value; updateMessagePreview(); });
  textareaVetSymptoms.addEventListener('input', (e) => {
    state.vetSymptoms = e.target.value;
    scanTriage(e.target.value);
    updateMessagePreview();
  });
  inputVetMeds.addEventListener('input', (e) => { state.vetMeds = e.target.value; updateMessagePreview(); });

  selectTimePreference.addEventListener('change', (e) => { state.timePreference = e.target.value; updateMessagePreview(); });
  selectDayPreference.addEventListener('change', (e) => { state.dayPreference = e.target.value; updateMessagePreview(); });
  checkTransport.addEventListener('change', (e) => { state.needsTransport = e.target.checked; updateMessagePreview(); });

  inputOwnerName.addEventListener('input', (e) => { state.ownerName = e.target.value; updateMessagePreview(); });
  inputOwnerPhone.addEventListener('input', (e) => { state.ownerPhone = e.target.value; updateMessagePreview(); });
  inputNotes.addEventListener('input', (e) => { state.notes = e.target.value; updateMessagePreview(); });

  // --- BUILD THE FORMATTED WHATSAPP MESSAGE ---
  function generateWhatsAppMessage() {
    const petLabel = state.petName ? state.petName.trim() : '[Nombre del perro]';
    const breedLabel = state.petBreed ? state.petBreed.trim() : '[Raza]';
    const ownerLabel = state.ownerName ? state.ownerName.trim() : '[Nombre del tutor]';
    const phoneLabel = state.ownerPhone ? state.ownerPhone.trim() : '[Teléfono]';

    let msg = '';

    if (state.service === 'grooming') {
      msg += `🐾 *SOLICITUD DE TURNO - PELUQUERÍA CANINA*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🐶 *Mascota:* ${petLabel} (${breedLabel})\n`;
      msg += `⚖️ *Tamaño/Peso:* ${state.petWeight}\n`;
      msg += `🎂 *Etapa:* ${state.petAge}\n`;
      msg += `✂️ *Servicio:* ${state.groomingService}\n`;
      msg += `🧶 *Estado nudos:* ${state.groomingKnots}\n`;
      msg += `⚠️ *Conducta:* ${state.groomingTemp}\n`;
      
      const skinParasiteNotes = [];
      if (state.hasFleas) skinParasiteNotes.push('⚠️ Pulgas/Garrapatas visibles');
      if (state.hasSensitiveSkin) skinParasiteNotes.push('🧴 Piel sensible / Alergia');
      if (skinParasiteNotes.length > 0) {
        msg += `🩺 *Piel/Parásitos:* ${skinParasiteNotes.join(' | ')}\n`;
      } else {
        msg += `🩺 *Piel/Parásitos:* Sin observaciones\n`;
      }

    } else {
      // VETERINARIA
      msg += `🩺 *SOLICITUD DE TURNO - VETERINARIA*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      if (state.triageLevel === 'urgent') {
        msg += `🚨 *TRIAJE IA: PRIORIDAD URGENTE*\n`;
        msg += `⚠️ _Posible urgencia detectada por síntomas críticos_\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      }
      msg += `🐶 *Paciente:* ${petLabel} (${breedLabel})\n`;
      msg += `⚖️ *Tamaño/Peso:* ${state.petWeight}\n`;
      msg += `🎂 *Etapa:* ${state.petAge}\n`;
      msg += `📋 *Motivo:* ${state.vetReason}\n`;
      
      const symptomsText = state.vetSymptoms.trim() || 'No especificados';
      msg += `🔍 *Síntomas descritos:* ${symptomsText}\n`;

      if (state.vetMeds.trim()) {
        msg += `💊 *Medicación actual:* ${state.vetMeds.trim()}\n`;
      }
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📅 *Preferencia:* ${state.timePreference}\n`;
    msg += `🗓️ *Día sugerido:* ${state.dayPreference}\n`;
    msg += `🚗 *Pet Taxi (Traslado):* ${state.needsTransport ? 'SÍ requiere traslado' : 'No requiere'}\n`;

    if (state.notes.trim()) {
      msg += `📝 *Notas extras:* ${state.notes.trim()}\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *Tutor:* ${ownerLabel}\n`;
    msg += `📱 *Teléfono:* ${phoneLabel}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_Solicitud generada desde el portal web CaniPet_`;

    return msg;
  }

  // --- UPDATE PREVIEW ---
  function updateMessagePreview() {
    const rawMsg = generateWhatsAppMessage();
    whatsappPreviewText.textContent = rawMsg;
  }

  // Initial preview render with default placeholders
  updateMessagePreview();

  // --- SEND BUTTON ACTION ---
  btnSendWhatsapp.addEventListener('click', () => {
    // Quick validation
    if (!state.petName.trim()) {
      alert('Por favor indicá el nombre de tu mascota.');
      inputPetName.focus();
      return;
    }
    if (!state.petBreed.trim()) {
      alert('Por favor indicá la raza o cruza de tu mascota.');
      inputPetBreed.focus();
      return;
    }
    if (!state.ownerName.trim()) {
      alert('Por favor indicá tu nombre para registrar la solicitud.');
      inputOwnerName.focus();
      return;
    }

    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const target = state.targetPhone.replace(/[^0-9]/g, '');

    const whatsappUrl = `https://wa.me/${target}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  });

  // --- MODAL CONFIG PHONE ---
  btnConfigPhone.addEventListener('click', () => {
    inputTargetPhone.value = state.targetPhone || '';
    modalPhone.classList.remove('hidden');
  });

  closeModalPhone.addEventListener('click', () => {
    modalPhone.classList.add('hidden');
  });

  btnSavePhone.addEventListener('click', () => {
    const val = inputTargetPhone.value.trim().replace(/[^0-9]/g, '');
    if (!val || val.length < 8) {
      alert('Ingresá un número de WhatsApp válido con código de país (ej: 5491123456789).');
      return;
    }
    state.targetPhone = val;
    localStorage.setItem('canipet_target_phone', val);
    updatePhoneDisplay();
    updateSeniorEscapeLinks();
    modalPhone.classList.add('hidden');
  });

  // --- SENIOR / ACCESSIBILITY MODE ---
  const btnToggleSeniorMode = document.getElementById('btn-toggle-senior-mode');
  const seniorModeLabel = document.getElementById('senior-mode-label');

  let isSeniorMode = localStorage.getItem('canipet_senior_mode') === 'true';

  function applySeniorMode(enabled) {
    if (enabled) {
      document.body.classList.add('senior-mode');
      if (seniorModeLabel) seniorModeLabel.textContent = 'Modo Normal';
      if (btnToggleSeniorMode) {
        btnToggleSeniorMode.classList.add('bg-emerald-100', 'text-emerald-800', 'border-emerald-300');
        btnToggleSeniorMode.classList.remove('bg-slate-100', 'text-slate-700', 'border-slate-200');
      }
    } else {
      document.body.classList.remove('senior-mode');
      if (seniorModeLabel) seniorModeLabel.textContent = 'Letra Grande';
      if (btnToggleSeniorMode) {
        btnToggleSeniorMode.classList.remove('bg-emerald-100', 'text-emerald-800', 'border-emerald-300');
        btnToggleSeniorMode.classList.add('bg-slate-100', 'text-slate-700', 'border-slate-200');
      }
    }
    localStorage.setItem('canipet_senior_mode', enabled ? 'true' : 'false');
  }

  if (btnToggleSeniorMode) {
    btnToggleSeniorMode.addEventListener('click', () => {
      isSeniorMode = !isSeniorMode;
      applySeniorMode(isSeniorMode);
    });
  }
  applySeniorMode(isSeniorMode);

  // --- SENIOR DIRECT ESCAPE BUTTONS ---
  const btnSeniorWhatsapp = document.getElementById('btn-senior-whatsapp');
  const btnSeniorCall = document.getElementById('btn-senior-call');

  function updateSeniorEscapeLinks() {
    const target = state.targetPhone.replace(/[^0-9]/g, '');
    if (btnSeniorWhatsapp) {
      const audioPromptText = encodeURIComponent("¡Hola CaniPet! 👋 Quisiera pedir un turno para mi perrito pero prefiero coordinar por mensaje o audio directo por acá. Mi nombre es: ");
      btnSeniorWhatsapp.href = `https://wa.me/${target}?text=${audioPromptText}`;
    }
    if (btnSeniorCall) {
      btnSeniorCall.href = `tel:+${target}`;
    }
  }
  updateSeniorEscapeLinks();

  // --- VOICE ASSISTANT / SPEECH RECOGNITION (DICTADO POR VOZ) ---
  const btnVoiceDictate = document.getElementById('btn-voice-dictate');
  const voiceStatusText = document.getElementById('voice-status-text');
  const voiceListeningIndicator = document.getElementById('voice-listening-indicator');
  const voiceTranscriptContainer = document.getElementById('voice-transcript-container');
  const voiceTranscriptText = document.getElementById('voice-transcript-text');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isRecording = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isRecording = true;
      btnVoiceDictate.classList.add('mic-recording');
      voiceListeningIndicator.classList.remove('hidden');
      voiceStatusText.innerHTML = '<strong class="text-red-600">Escuchando con atención...</strong> Hablá con tranquilidad, te escuchamos.';
    };

    recognition.onend = () => {
      isRecording = false;
      btnVoiceDictate.classList.remove('mic-recording');
      voiceListeningIndicator.classList.add('hidden');
      voiceStatusText.innerHTML = '¡Dictado recibido! Podés volver a presionar si querés agregar algo más.';
    };

    recognition.onerror = () => {
      isRecording = false;
      btnVoiceDictate.classList.remove('mic-recording');
      voiceListeningIndicator.classList.add('hidden');
      voiceStatusText.innerHTML = 'No pudimos captar tu voz con claridad. Por favor intentá de nuevo o tocá abajo para mandar un audio por WhatsApp.';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      voiceTranscriptContainer.classList.remove('hidden');
      voiceTranscriptText.textContent = `"${transcript}"`;
      parseVoiceTranscript(transcript);
    };
  }

  function parseVoiceTranscript(rawText) {
    const text = rawText.toLowerCase();

    // 1. Service Detection
    const vetTriggers = ['veterinaria', 'consulta', 'vacuna', 'enfermo', 'vómito', 'vomito', 'lastimad', 'rengo', 'renguea', 'inyeccion', 'inyección', 'decaído', 'decaido', 'control'];
    const groomingTriggers = ['baño', 'bano', 'corte', 'peluquería', 'peluqueria', 'peluquero', 'peinar', 'deslanado', 'uñas', 'unas'];

    const isVet = vetTriggers.some(w => text.includes(w));
    const isGrooming = groomingTriggers.some(w => text.includes(w));

    if (isVet && !isGrooming) {
      setService('vet');
      textareaVetSymptoms.value = rawText;
      state.vetSymptoms = rawText;
      scanTriage(rawText);
    } else if (isGrooming) {
      setService('grooming');
    }

    // 2. Dog Breed detection
    const commonBreeds = [
      'caniche', 'golden', 'labrador', 'mestizo', 'salchicha', 'dachshund',
      'bulldog', 'pastor', 'ovejero', 'pitbull', 'boxer', 'chihuahua',
      'shih tzu', 'yorkshire', 'border collie', 'schnauzer', 'beagle', 'pug', 'cocker'
    ];
    for (const b of commonBreeds) {
      if (text.includes(b)) {
        inputPetBreed.value = b.charAt(0).toUpperCase() + b.slice(1);
        state.petBreed = inputPetBreed.value;
        break;
      }
    }

    // 3. Pet Name detection
    const nameMatches = text.match(/(?:se llama|llamado|mi perro es|mi perro|mi perrito)\s+([a-záéíóúñ]+)/i);
    if (nameMatches && nameMatches[1]) {
      const detectedName = nameMatches[1];
      const excludedWords = ['un', 'una', 'el', 'la', 'mi', 'su', 'que', 'chico', 'grande'];
      if (!excludedWords.includes(detectedName.toLowerCase())) {
        inputPetName.value = detectedName.charAt(0).toUpperCase() + detectedName.slice(1);
        state.petName = inputPetName.value;
      }
    }

    // 4. Notes
    if (state.service === 'grooming' && !state.notes) {
      inputNotes.value = `Dictado por voz: "${rawText}"`;
      state.notes = inputNotes.value;
    }

    updateMessagePreview();
  }

  if (btnVoiceDictate) {
    btnVoiceDictate.addEventListener('click', () => {
      if (!SpeechRecognition) {
        alert('El dictado por voz directo no está soportado en este navegador de escritorio. ¡Podés usar el botón amarillo de abajo para mandar un audio por WhatsApp directo!');
        return;
      }
      if (isRecording) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  // Clock in phone mockup
  const mockupClock = document.getElementById('mockup-clock');
  function updateMockupClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (mockupClock) mockupClock.textContent = `${hours}:${mins}`;
  }
  updateMockupClock();
  setInterval(updateMockupClock, 30000);
});
