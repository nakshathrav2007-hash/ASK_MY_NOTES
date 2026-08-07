const pdfInput = document.getElementById('pdf-input');
const uploadStatus = document.getElementById('upload-status');
const questionInput = document.getElementById('question');
const askButton = document.getElementById('ask-btn');
const statusMessage = document.getElementById('status');
const answerEmpty = document.getElementById('answer-empty');
const answerContainer = document.getElementById('answer');
const answerText = document.getElementById('answer-text');
const qtypePill = document.getElementById('qtype-pill');
const toolPill = document.getElementById('tool-pill');
const copyButton = document.getElementById('copy-btn');
const sources = document.getElementById('sources');
const sourcesList = document.getElementById('sources-list');
const thumbUp = document.getElementById('thumb-up');
const thumbDown = document.getElementById('thumb-down');

const state = {
  selectedFile: null,
};

function setUploadStatus(message, isError = false) {
  uploadStatus.textContent = message;
  uploadStatus.style.color = isError ? '#b42318' : '#3f2d3d';
}

function setQuestionStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#b42318' : '#3f2d3d';
}

function setAnswerVisibility(visible) {
  answerEmpty.hidden = visible;
  answerContainer.hidden = !visible;
}

function getQuestionType(question) {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('summary') || lowerQuestion.includes('summarize') || lowerQuestion.includes('overview')) {
    return 'Summary';
  }

  if (lowerQuestion.includes('what is') || lowerQuestion.includes('define') || lowerQuestion.includes('explain')) {
    return 'Definition';
  }

  if (lowerQuestion.includes('how') || lowerQuestion.includes('steps') || lowerQuestion.includes('process')) {
    return 'How-to';
  }

  if (lowerQuestion.includes('why') || lowerQuestion.includes('reason') || lowerQuestion.includes('cause')) {
    return 'Reasoning';
  }

  return 'General';
}

function buildDemoAnswer(question, fileName) {
  const cleanFileName = fileName.replace(/\.pdf$/i, '');
  const questionType = getQuestionType(question);

  if (questionType === 'Summary') {
    return `The uploaded notes in “${cleanFileName}” appear to contain a set of core ideas, supporting details, and actions worth summarizing. A strong summary would focus on the main topic, the most important facts, and the practical takeaways from the document.`;
  }

  if (questionType === 'Definition') {
    return `Based on the notes in “${cleanFileName}”, the concept being asked about is explained as a key idea or term within the document. In a real PDF Q&A workflow, this answer would be grounded directly in the source text and citations from the uploaded notes.`;
  }

  if (questionType === 'How-to') {
    return `The notes in “${cleanFileName}” likely describe a process or set of steps. A complete answer would explain the action sequence, the required context, and any important caveats mentioned in the PDF.`;
  }

  if (questionType === 'Reasoning') {
    return `The document suggests the reason is tied to the core assumptions or evidence included in the notes. To answer this precisely, the system would need to identify the supporting passages in “${cleanFileName}” and explain how they support the conclusion.`;
  }

  return `From the uploaded document “${cleanFileName}”, the question “${question}” can be answered by looking for the most relevant passages in the notes and summarizing the document’s main evidence. This demo shows the answer panel and interaction flow while a full PDF-to-AI backend can provide grounded answers from the file content.`;
}

function updateSources(fileName) {
  const sourceName = fileName || 'Uploaded notes';
  sourcesList.innerHTML = '';

  const item = document.createElement('li');
  item.textContent = sourceName;
  sourcesList.appendChild(item);

  sources.hidden = false;
}

function resetFeedbackButtons() {
  thumbUp.classList.remove('selected');
  thumbDown.classList.remove('selected');
}

function handleUpload() {
  const file = pdfInput.files[0];

  if (!file) {
    setUploadStatus('No file selected yet.', true);
    return;
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    setUploadStatus('Please upload a valid PDF file.', true);
    state.selectedFile = null;
    return;
  }

  state.selectedFile = file;
  setUploadStatus(`Loaded: ${file.name}`);
  setQuestionStatus('');
}

function handleAskQuestion() {
  const cleanQuestion = questionInput.value.trim();

  if (!state.selectedFile) {
    setQuestionStatus('Please upload a PDF before asking a question.', true);
    return;
  }

  if (!cleanQuestion) {
    setQuestionStatus('Please type a question first.', true);
    return;
  }

  setQuestionStatus('Searching the notes...');

  const questionType = getQuestionType(cleanQuestion);
  const answer = buildDemoAnswer(cleanQuestion, state.selectedFile.name);

  qtypePill.textContent = questionType;
  qtypePill.hidden = false;

  toolPill.textContent = 'Demo mode';
  toolPill.hidden = false;

  answerText.textContent = answer;
  setAnswerVisibility(true);
  updateSources(state.selectedFile.name);
  resetFeedbackButtons();
  setQuestionStatus('Answer ready.');
}

async function copyAnswer() {
  const text = answerText.textContent.trim();

  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = '✓ Copied';
    setTimeout(() => {
      copyButton.textContent = '⎘ Copy Answer';
    }, 1200);
  } catch (error) {
    setQuestionStatus('Copy failed. Please copy the text manually.', true);
  }
}

function handleFeedback(button, isHelpful) {
  resetFeedbackButtons();
  button.classList.add('selected');
  const message = isHelpful ? 'Thanks for the feedback.' : 'Thanks for the feedback.';
  setQuestionStatus(message);
}

pdfInput.addEventListener('change', handleUpload);
askButton.addEventListener('click', handleAskQuestion);
copyButton.addEventListener('click', copyAnswer);
thumbUp.addEventListener('click', () => handleFeedback(thumbUp, true));
thumbDown.addEventListener('click', () => handleFeedback(thumbDown, false));

setAnswerVisibility(false);
setUploadStatus('No file selected yet.');
setQuestionStatus('');