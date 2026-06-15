const buttons = document.querySelectorAll('.buy-btn[data-plan]');
const selectedPlan = document.getElementById('selected-plan');

const checkoutModal = document.getElementById('checkout-modal');
const bankModal = document.getElementById('bank-modal');
const checkoutForm = document.getElementById('checkout-form');
const cancelCheckout = document.getElementById('cancel-checkout');
const doneButton = document.getElementById('done-button');

const plans = {
  video: { title: 'ვიდეოგაკვეთილები', price: '₾140' },
  'video-plus': { title: 'ვიდეო + პრაქტიკა', price: '₾365' },
  internship: { title: 'სტაჟირება', price: '₾790' },
};

let currentPlan = null;

function openModal(modal) { modal.setAttribute('aria-hidden', 'false'); }
function closeModal(modal) { modal.setAttribute('aria-hidden', 'true'); }

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const planKey = button.dataset.plan;
    currentPlan = plans[planKey];
    selectedPlan.textContent = `თქვენ აირჩიეთ: ${currentPlan.title} — ${currentPlan.price}`;
    // open checkout form modal
    openModal(checkoutModal);
  });
});

cancelCheckout.addEventListener('click', () => {
  closeModal(checkoutModal);
});

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(checkoutForm);
  const order = {
    firstName: form.get('firstName'),
    lastName: form.get('lastName'),
    phone: form.get('phone'),
    plan: currentPlan ? currentPlan.title : null,
    price: currentPlan ? currentPlan.price : null,
    createdAt: new Date().toISOString(),
  };

  // Try to send to local backend endpoint. If it fails, save to localStorage as fallback.
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Server error');
    // success — show bank details modal
    closeModal(checkoutModal);
    openModal(bankModal);
  } catch (err) {
    // fallback: save pending order locally
    const pending = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    pending.push(order);
    localStorage.setItem('pendingOrders', JSON.stringify(pending));
    closeModal(checkoutModal);
    openModal(bankModal);
  }
});

// bank modal actions
doneButton.addEventListener('click', () => {
  closeModal(bankModal);
  selectedPlan.textContent = 'დიახ, ჩვენი კომპლიმენტი: წესით, ჩვენ მივიღებთ შენს შეტყობინებას.';
  currentPlan = null;
});

// details toggle
const toggleDetailsBtn = document.querySelector('.toggle-details-btn');
const detailsContent = document.querySelector('.details-content');

if (toggleDetailsBtn && detailsContent) {
  toggleDetailsBtn.addEventListener('click', () => {
    const expanded = detailsContent.classList.toggle('expanded');
    detailsContent.classList.toggle('collapsed', !expanded);
    toggleDetailsBtn.textContent = expanded ? 'ნაკლებად ჩვენება' : 'მეტის ჩვენება';
  });
}

// copy account buttons
document.querySelectorAll('.copy-account').forEach(btn => {
  btn.addEventListener('click', async () => {
    const ibanEl = btn.parentElement.querySelector('.iban');
    const text = ibanEl ? ibanEl.textContent.trim() : '';
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'კოპირებულია';
      setTimeout(() => { btn.textContent = 'კოპირება'; }, 1500);
    } catch (e) {
      alert('კოპირება ვერ გაკეთდა. აიძულეთ დაწვრილებით: ' + text);
    }
  });
});

// On load: ensure modals hidden
closeModal(checkoutModal);
closeModal(bankModal);
