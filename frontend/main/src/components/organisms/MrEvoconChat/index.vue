<template>
  <v-card
    class="mr-evocon-chat d-flex flex-column"
    :class="{ 'mr-evocon-chat--mobile': isMobileView }"
    :elevation="2"
    rounded="lg"
  >
    <!-- Header -->
    <div class="mec-header d-flex align-center pl-4 pr-2">
      <static-mr-evocon
        state="positive"
        max-width="32px"
        max-height="32px"
        class="flex-shrink-0"
      />
      <div class="flex-grow-1 min-w-0 px-3">
        <div class="text-body-large font-weight-medium text-truncate">
          {{ $t('Mr. Evocon') }}
        </div>
        <div class="text-body-small text-secondary-text text-truncate">
          {{ $t('Ask anything about your production data') }}
        </div>
      </div>
      <evocon-v-tooltip-wrap :text="$t('Close')">
        <template #activator="{ props: tooltipProps }">
          <evocon-v-button
            v-bind="tooltipProps"
            :icon="mdiClose"
            color="secondary-text"
            :aria-label="$t('Close')"
            @click="onClose"
          />
        </template>
      </evocon-v-tooltip-wrap>
    </div>

    <v-divider />

    <!-- Messages -->
    <div
      ref="messagesEl"
      class="mec-messages flex-grow-1 px-4 py-4"
      role="log"
      aria-live="polite"
    >
      <!-- Greeting + suggestions -->
      <div class="mec-row-bot">
        <div class="mec-bubble mec-bubble-bot">
          {{ $t("Hi, I'm Mr. Evocon — your Evocon support assistant. Ask me about dashboards, reports, downtime tracking, or anything else. Here are some things to try:") }}
        </div>
        <div v-if="suggestionsShown" class="mec-chips d-flex flex-wrap mt-3">
          <evocon-v-chip
            v-for="suggestion in suggestions"
            :key="suggestion"
            type="outlined"
            :label="$t(suggestion)"
            active
            class="mr-2 mb-2"
            @select="onSuggestionClick(suggestion)"
          />
        </div>
      </div>

      <!-- Message turns -->
      <template v-for="(msg, index) in messages" :key="index">
        <div v-if="msg.role === 'user'" class="mec-row-user d-flex justify-end mt-4">
          <div class="mec-bubble mec-bubble-user">
            {{ msg.text }}
          </div>
        </div>
        <div v-else class="mec-row-bot mt-4">
          <div
            v-if="msg.kind === 'error'"
            class="mec-bubble mec-bubble-bot text-error"
          >
            {{ msg.text }}
          </div>
          <div
            v-else-if="msg.kind === 'info'"
            class="mec-bubble mec-bubble-bot mec-bubble-info text-tertiary-text"
          >
            {{ msg.text }}
          </div>
          <template v-else>
            <!-- eslint-disable vue/no-v-html -->
            <div
              class="mec-bubble mec-bubble-bot"
              v-html="renderAnswer(msg.text)"
            />
            <!-- eslint-enable vue/no-v-html -->
            <div v-if="msg.sources && msg.sources.length" class="mec-sources mt-3 pt-2">
              <div class="text-label-small text-tertiary-text mb-1">
                {{ msg.sources.length === 1 ? $t('Source') : $t('Sources') }}
              </div>
              <div class="d-flex flex-wrap">
                <a
                  v-for="src in msg.sources"
                  :key="src"
                  :href="src"
                  target="_blank"
                  rel="noopener"
                  class="mec-source-chip mr-1 mb-1"
                >
                  <v-icon :size="14" class="mr-1">{{ mdiOpenInNew }}</v-icon>
                  <span class="text-truncate">{{ labelFromUrl(src) }}</span>
                </a>
              </div>
            </div>
            <div class="mec-feedback d-flex align-center mt-2">
              <evocon-v-tooltip-wrap :text="$t('Helpful')">
                <template #activator="{ props: tooltipProps }">
                  <evocon-v-button
                    v-bind="tooltipProps"
                    :icon="msg.feedback === 'up' ? mdiThumbUp : mdiThumbUpOutline"
                    :color="msg.feedback === 'up' ? 'primary' : 'secondary-text'"
                    :disabled="!!msg.feedback"
                    :aria-label="$t('Helpful')"
                    @click="onFeedback(index, 'up')"
                  />
                </template>
              </evocon-v-tooltip-wrap>
              <evocon-v-tooltip-wrap :text="$t('Not helpful')">
                <template #activator="{ props: tooltipProps }">
                  <evocon-v-button
                    v-bind="tooltipProps"
                    :icon="msg.feedback === 'down' ? mdiThumbDown : mdiThumbDownOutline"
                    :color="msg.feedback === 'down' ? 'error' : 'secondary-text'"
                    :disabled="!!msg.feedback"
                    :aria-label="$t('Not helpful')"
                    @click="onFeedback(index, 'down')"
                  />
                </template>
              </evocon-v-tooltip-wrap>
              <copy-to-clipboard-button is-text :content="msg.text" />
              <span
                v-if="msg.feedback"
                class="text-body-small text-secondary-text ml-2"
              >
                {{ $t('Thanks for the feedback') }}
              </span>
            </div>
            <div v-if="msg.feedback === 'down' && !msg.commentSent" class="mec-fb-comment mt-2 pa-3 rounded">
              <evocon-v-textarea
                v-model="msg.commentDraft"
                :placeholder="$t('What was the first thing that went wrong?')"
                rows="2"
                hide-details
                density="compact"
              />
              <div class="d-flex justify-end mt-2">
                <evocon-v-button
                  text="Skip"
                  type="secondary"
                  size="small"
                  @click="onFeedbackComment(index, '')"
                />
                <evocon-v-button
                  text="Send"
                  size="small"
                  @click="onFeedbackComment(index, msg.commentDraft)"
                />
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- Typing indicator -->
      <div v-if="isSending" class="mec-row-bot mt-4">
        <div class="mec-bubble mec-bubble-bot mec-typing">
          <span /><span /><span />
        </div>
      </div>
    </div>

    <!-- Privacy banner (per-session, sits above input) -->
    <div v-if="!consented" class="mec-privacy d-flex align-start px-4 py-3">
      <v-icon :size="14" color="tertiary-text" class="mt-1 mr-2 flex-shrink-0">
        {{ mdiInformationOutline }}
      </v-icon>
      <label class="d-flex align-start cursor-pointer flex-grow-1">
        <v-checkbox
          v-model="consented"
          color="primary"
          hide-details
          density="compact"
          class="flex-shrink-0 mr-2"
        />
        <span class="text-body-small text-secondary-text mt-2">
          {{ $t('I agree that conversations are saved to help improve Mr. Evocon.') }}
          <a
            :href="privacyUrl"
            target="_blank"
            rel="noopener"
            class="mec-privacy-link"
            @click.stop
          >
            {{ $t('See our privacy notice.') }}
          </a>
        </span>
      </label>
    </div>

    <!-- Input row -->
    <div class="mec-input-wrap px-3 pt-2 pb-3">
      <div class="mec-input-row d-flex align-end">
        <v-textarea
          v-model="inputValue"
          :placeholder="inputPlaceholder"
          variant="solo-filled"
          flat
          auto-grow
          rows="1"
          max-rows="4"
          hide-details
          density="comfortable"
          color="primary"
          :disabled="!consented"
          class="flex-grow-1"
          @keydown="onInputKeydown"
        />
        <v-btn
          :icon="true"
          :color="isSending ? '' : 'primary'"
          :variant="isSending ? 'text' : 'flat'"
          :disabled="isSending ? false : (!consented || !inputValue.trim())"
          :aria-label="isSending ? $t('Stop') : $t('Send')"
          size="small"
          class="ml-2 mb-1"
          @click="isSending ? stopGeneration() : sendMessage()"
        >
          <v-icon>
            {{ isSending ? mdiStop : mdiSend }}
          </v-icon>
        </v-btn>
      </div>
      <div class="text-body-small text-tertiary-text text-center mt-2">
        {{ $t('Answers are AI-generated — double-check anything critical.') }}
      </div>
    </div>
  </v-card>
</template>

<script setup name="MrEvoconChat">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import DOMPurify from 'dompurify';
import {
  mdiClose,
  mdiSend,
  mdiStop,
  mdiThumbUp,
  mdiThumbUpOutline,
  mdiThumbDown,
  mdiThumbDownOutline,
  mdiInformationOutline,
  mdiOpenInNew,
} from '@mdi/js';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import StaticMrEvocon from '@/components/atoms/StaticMrEvocon/index.vue';
import CopyToClipboardButton from '@/components/atoms/CopyToClipboardButton/index.vue';
import { useDeviceStore } from '@/stores/index';

const props = defineProps({
  chatEndpoint: { type: String, default: '/chat' },
  feedbackEndpoint: { type: String, default: '/feedback' },
  privacyUrl: {
    type: String,
    default: 'https://143752644.fs1.hubspotusercontent-eu1.net/hubfs/143752644/Terms%20of%20service%20documents%202026%20Jan/Evocon%20Privacy%20Notice.pdf',
  },
  mockBackend: { type: Boolean, default: false },
  suggestions: {
    type: Array,
    default: () => [
      'Why is my shift view red?',
      'Set up a new station',
      'Export OEE report',
      'Add a stop reason',
    ],
  },
});

const emit = defineEmits(['close']);

const deviceStore = useDeviceStore();
const isMobileView = computed(() => deviceStore.isMobileView);

const messages = reactive([]);
const inputValue = ref('');
const isSending = ref(false);
const suggestionsShown = ref(true);
const consented = ref(false);
const sessionId = ref(newSessionId());
const messagesEl = ref(null);
let abortController = null;

const { t } = useI18n();

const inputPlaceholder = computed(() => (consented.value
  ? t('Ask Mr. Evocon…')
  : t('Tick the consent box above to start chatting')));

const SESSION_ID_LENGTH = 8;
const RANDOM_BASE = 36;
const RANDOM_SLICE_START = 2;
const RANDOM_SLICE_END = 10;

function newSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `web-${crypto.randomUUID().slice(0, SESSION_ID_LENGTH)}`;
  }
  return `web-${Math.random().toString(RANDOM_BASE).slice(RANDOM_SLICE_START, RANDOM_SLICE_END)}`;
}

function labelFromUrl(url) {
  try {
    const u = new URL(url);
    const slug = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
    return decodeURIComponent(slug)
      .replace(/-[a-f0-9]{20,}$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();
  } catch {
    return url;
  }
}

// Minimal markdown: bold, italic, inline-code, links, paragraphs, line breaks.
// Output is sanitized via DOMPurify before render.
function renderAnswer(text) {
  if (!text) return '';
  const escape = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  let html = escape(text);
  html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1<em>$2</em>');
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]{1,2000})\)/g, // eslint-disable-line sonarjs/slow-regex
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );
  html = html
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  });
}

function onSuggestionClick(text) {
  inputValue.value = text;
  sendMessage();
}

function onInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

const MOCK_LATENCY_MS = 900;

function getMockAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes('shift view')) {
    return {
      answer: "**Shift view turns red** when there is an active stop on the line that hasn't been acknowledged.\n\n- Check the [stop reasons](https://www.evocon.com/help-center/stop-reasons) for the active machine\n- Acknowledge the stop with the operator\n- If the stop reason is missing, add a new one in *Settings → Stop Reasons*\n\nIf the red persists after acknowledging, refresh the page or check that your station is online.",
      sources: [
        'https://www.evocon.com/help-center/shift-view-red-state',
        'https://www.evocon.com/help-center/stop-reasons',
      ],
    };
  }
  if (q.includes('station')) {
    return {
      answer: 'To **set up a new station**:\n\n1. Go to *Settings → Stations*\n2. Click **Add station** in the top-right\n3. Pick the machine from the dropdown\n4. Configure the input signal on the IoT box\n5. Save and assign operators\n\nThe station will appear in Shift View immediately.',
      sources: ['https://www.evocon.com/help-center/setting-up-stations'],
    };
  }
  if (q.includes('oee') || q.includes('export')) {
    return {
      answer: 'You can export the OEE report from **Reports → OEE → Export** in the top-right toolbar. The export includes Availability, Performance, Quality and per-shift, per-station, per-product breakdowns.',
      sources: ['https://www.evocon.com/help-center/oee-report-export'],
    };
  }
  if (q.includes('stop reason')) {
    return {
      answer: 'Stop reasons live under **Settings → Stop Reasons**. Click **Add reason**, give it a name, pick a category (planned / unplanned / changeover) and assign a color so it stands out in Shift View.',
      sources: ['https://www.evocon.com/help-center/stop-reasons'],
    };
  }
  return {
    answer: "I don't have a confident answer for that yet — try rephrasing, or check the [Evocon Help Center](https://www.evocon.com/help-center) for the full documentation.",
    sources: [],
  };
}

function mockFetch(text, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(getMockAnswer(text)), MOCK_LATENCY_MS);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}

async function sendMessage() {
  if (isSending.value) return;
  const text = inputValue.value.trim();
  if (!text || !consented.value) return;

  suggestionsShown.value = false;
  messages.push({ role: 'user', text });
  inputValue.value = '';
  scrollToBottom();

  isSending.value = true;
  abortController = new AbortController();

  try {
    if (props.mockBackend) {
      const data = await mockFetch(text, abortController.signal);
      messages.push({
        role: 'bot',
        text: data.answer || '',
        sources: data.sources || [],
        feedback: null,
        commentDraft: '',
        commentSent: false,
      });
    } else {
      const res = await fetch(props.chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, session_id: sessionId.value }),
        signal: abortController.signal,
      });

      if (res.ok) {
        const data = await res.json();
        messages.push({
          role: 'bot',
          text: data.answer || '',
          sources: data.sources || [],
          feedback: null,
          commentDraft: '',
          commentSent: false,
        });
      } else {
        messages.push({ role: 'bot', kind: 'error', text: t('Sorry, something went wrong. Please try again.') });
      }
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      messages.push({ role: 'bot', kind: 'info', text: t('Generation stopped.') });
    } else {
      messages.push({ role: 'bot', kind: 'error', text: t("Couldn't reach Mr. Evocon. Check your connection and try again.") });
    }
  } finally {
    abortController = null;
    isSending.value = false;
    scrollToBottom();
  }
}

function stopGeneration() {
  if (abortController) abortController.abort();
}

async function postFeedback(payload) {
  try {
    await fetch(props.feedbackEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn('feedback failed', e);
  }
}

function botTurnIndex(arrIndex) {
  let count = -1;
  for (let i = 0; i <= arrIndex; i += 1) {
    if (messages[i].role === 'bot') count += 1;
  }
  return count;
}

function onFeedback(index, signal) {
  const msg = messages[index];
  msg.feedback = signal;
  if (signal === 'up') {
    postFeedback({
      session_id: sessionId.value,
      turn_index: botTurnIndex(index),
      signal,
      comment: '',
    });
  }
}

function onFeedbackComment(index, comment) {
  const msg = messages[index];
  msg.commentSent = true;
  postFeedback({
    session_id: sessionId.value,
    turn_index: botTurnIndex(index),
    signal: 'down',
    comment: comment || '',
  });
}

function onClose() {
  emit('close');
}

function onKeydown(event) {
  if (event.key === 'Escape') onClose();
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});

watch(messages, () => scrollToBottom(), { deep: true });
</script>

<style lang="scss" scoped>
.mr-evocon-chat {
  width: 440px;
  max-width: 100%;
  height: min(720px, calc(100vh - 48px));
  overflow: hidden;
  background: rgb(var(--v-theme-toolbar-background));

  &--mobile {
    width: 100%;
    height: 100vh;
    border-radius: 0 !important;
  }
}

.mec-header {
  flex-shrink: 0;
  min-height: 56px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.mec-messages {
  overflow-y: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar { width: 10px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgb(var(--v-theme-grey-light));
    border-radius: 5px;
    border: 2px solid rgb(var(--v-theme-toolbar-background));
  }
}

.mec-row-bot { display: flex; flex-direction: column; align-items: flex-start; max-width: 92%; }

.mec-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.375rem;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
}
.mec-bubble-bot {
  background: rgb(var(--v-theme-input-background));
  color: rgb(var(--v-theme-primary-text));
  border: 1px solid rgb(var(--v-theme-grey-light));
  border-top-left-radius: 4px;
}
.mec-bubble-bot :deep(p) { margin-bottom: 8px; }
.mec-bubble-bot :deep(p:last-child) { margin-bottom: 0; }
.mec-bubble-bot :deep(strong) { font-weight: 600; }
.mec-bubble-bot :deep(em) { font-style: italic; }
.mec-bubble-bot :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 600;
}
.mec-bubble-bot :deep(a:hover) { text-decoration: underline; }
.mec-bubble-bot :deep(code) {
  background: #ECEFF1;
  padding: 1px 6px;
  border-radius: 4px;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.8125rem;
}
.mec-bubble-info { font-style: italic; }

.mec-bubble-user {
  background: rgb(var(--v-theme-primary));
  color: #FFFFFF;
  border-top-right-radius: 4px;
  font-weight: 600;
  max-width: 85%;
}

.mec-sources {
  border-top: 1px solid rgb(var(--v-theme-grey-light));
}
.mec-source-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  line-height: 1rem;
  color: rgb(var(--v-theme-secondary-text));
  background: rgb(var(--v-theme-toolbar-background));
  border: 1px solid rgb(var(--v-theme-grey-light));
  border-radius: 16px;
  padding: 4px 10px;
  text-decoration: none;
  max-width: 100%;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.12);
    border-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-primary));
  }
  span { max-width: 220px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
}

.mec-fb-comment {
  background: rgb(var(--v-theme-input-background));
  max-width: 100%;
}

.mec-typing {
  padding: 8px 12px;
  display: flex;
  gap: 4px;
  align-items: center;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgb(var(--v-theme-tertiary-text));
    animation: mec-bounce 1.2s infinite;
  }
  span:nth-child(2) { animation-delay: 0.15s; }
  span:nth-child(3) { animation-delay: 0.3s; }
}
@keyframes mec-bounce {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

.mec-privacy {
  background: rgb(var(--v-theme-toolbar-background));
  border-top: 1px solid rgb(var(--v-theme-grey-light));
  flex-shrink: 0;
}
.mec-privacy-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 600;

  &:hover { text-decoration: underline; }
}

.mec-input-wrap {
  flex-shrink: 0;
  background: rgb(var(--v-theme-toolbar-background));
  border-top: 1px solid rgb(var(--v-theme-grey-light));
}
</style>
