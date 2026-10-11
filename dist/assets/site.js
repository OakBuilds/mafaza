'use strict';
const menuButton = document.querySelector('.menu-toggle');
const header = document.querySelector('.header');
const nav = document.querySelector('#primary-nav');
function closeMenu(returnFocus = false) {
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && header.classList.contains('menu-open')) closeMenu(true); });
document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); });
window.matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
document.querySelectorAll('[data-dialog-open]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.dialogOpen).showModal());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-dialog-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});
function openSection() {
  if (!location.hash) return;
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const section = document.getElementById(id);
  if (section?.tagName === 'DETAILS') section.open = true;
}
openSection();
window.addEventListener('hashchange', openSection);
const inquiryForm = document.querySelector('#inquiry-form');
if (inquiryForm) {
  const service = new URLSearchParams(location.search).get('service');
  if (service && Array.from(inquiryForm.elements.service.options).some(o => o.value === service)) inquiryForm.elements.service.value = service;
  inquiryForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    const f = new FormData(inquiryForm);
    const subject = `Website inquiry: ${f.get('service')}`;
    const body = `Hello Mafaza Networks,\n\n${f.get('message').trim()}\n\nName: ${f.get('name').trim()}\nCompany: ${f.get('company').trim() || 'Not provided'}\nEmail: ${f.get('email').trim()}\nService: ${f.get('service')}\n\nPrepared from the redesign prototype.`;
    document.querySelector('#draft-subject').textContent = subject;
    document.querySelector('#draft-body').textContent = body;
    document.querySelector('#open-draft').href = `mailto:info@mafazanetwork.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.querySelector('#email-draft').showModal();
    document.querySelector('#form-status').textContent = 'Your draft is ready to review. Nothing has been sent.';
  });
}
