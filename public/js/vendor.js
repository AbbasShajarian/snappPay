// Initialize Leaflet map
const map = L.map('map').setView([35.6892, 51.3890], 15); // Default to Tehran
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Global variable to hold the marker
let marker = null;

// Marketing area data
const marketingAreas = {
  Mall: [
    'مجتمع بوستان',
    'تیراژه 1',
    'تیراژه 2',
    'پاساژ قائم',
    'سیوان سنتر',
    'مرکز خرید ونک',
    'سون سنتر',
    'مرکز خرید ظفر',
    'اندیشه',
    'پاساژ نصر'
  ],
  Street: [
    'هفت‌حوض - نارمک',
    'جمهوری',
    'منوچهری',
    'منیریه',
    'خیابان بهشتی (سه‌راه گوهردشت)',
    'خیابان گوهردشت (رجایی‌شهر)',
    'خیابان طالقانی',
    'خیابان درختی'
  ]
};

// Function to update marketing area name options
function updateMarketingAreaNameOptions() {
  const marketingAreaType = document.getElementById('marketing-area-type').value;
  const marketingAreaNameSelect = document.getElementById('marketing-area-name');
  
  // Clear existing options
  marketingAreaNameSelect.innerHTML = '<option value="" disabled selected>انتخاب کنید</option>';
  
  if (marketingAreaType && marketingAreas[marketingAreaType]) {
    // Add options based on selected type
    marketingAreas[marketingAreaType].forEach(area => {
      const option = document.createElement('option');
      option.value = area;
      option.textContent = area;
      marketingAreaNameSelect.appendChild(option);
    });
  }
}

// Add location button to map
const locationButton = L.Control.extend({
  options: {
    position: 'topleft'
  },
  onAdd: function() {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    const button = L.DomUtil.create('a', 'location-button', container);
    button.innerHTML = '📍';
    button.title = 'موقعیت من';
    button.style.cssText = `
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      background: white;
      border: 2px solid rgba(0,0,0,0.2);
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      color: #0077cc;
    `;
    
    button.onclick = function() {
      getCurrentLocation();
    };
    
    return container;
  }
});

map.addControl(new locationButton());

// Function to get current location
function getCurrentLocation() {
  if (navigator.geolocation) {
    // Show loading state
    const button = document.querySelector('.location-button');
    button.innerHTML = '⏳';
    button.style.color = '#ffa500';
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition(latitude, longitude);
        
        // Reset button
        button.innerHTML = '📍';
        button.style.color = '#0077cc';
        
        // Show success message
        document.getElementById('form-message').textContent = 'موقعیت شما با موفقیت پیدا شد!';
        document.getElementById('form-message').style.color = 'green';
      },
      (error) => {
        // Reset button
        button.innerHTML = '📍';
        button.style.color = '#0077cc';
        
        // Show error message
        let errorMessage = 'خطا در پیدا کردن موقعیت';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'دسترسی به موقعیت مکانی رد شد. لطفاً مجوز را فعال کنید.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'اطلاعات موقعیت در دسترس نیست.';
            break;
          case error.TIMEOUT:
            errorMessage = 'زمان درخواست موقعیت به پایان رسید.';
            break;
        }
        document.getElementById('form-message').textContent = errorMessage;
        document.getElementById('form-message').style.color = 'red';
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  } else {
    document.getElementById('form-message').textContent = 'مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.';
    document.getElementById('form-message').style.color = 'red';
  }
}

// Function to format time in ISO format for proper date filtering
function formatTime(date = new Date()) {
  return date.toISOString();
}

// Function to update location fields and marker popup
function updateLocation(latitude, longitude) {
  document.getElementById('latitude').value = latitude.toFixed(6);
  document.getElementById('longitude').value = longitude.toFixed(6);

  // Reverse geocoding to get city and street
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
    .then(response => response.json())
    .then(data => {
      const city = data.address.city || data.address.town || 'نامشخص';
      const street = data.address.road || 'نامشخص';
      document.getElementById('city').value = city;
      document.getElementById('street').value = street;
      if (marker) {
        marker.setPopupContent(`موقعیت: ${city}, ${street}`).openPopup();
      }
    })
    .catch(() => {
      document.getElementById('city').value = 'نامشخص';
      document.getElementById('street').value = 'نامشخص';
      if (marker) {
        marker.setPopupContent('موقعیت: نامشخص').openPopup();
      }
    });
}

// Function to handle map click or marker drag
function setMarkerPosition(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.bindPopup('موقعیت شما').openPopup();
    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      updateLocation(position.lat, position.lng);
    });
  }
  map.setView([lat, lng], 15);
  updateLocation(lat, lng);
}

// Function to handle contract registered change
function handleContractRegisteredChange() {
  const contractRegistered = document.getElementById('contract-registered').value;
  const contractFields = document.getElementById('contract-fields');
  
  if (contractRegistered === 'بله') {
    contractFields.style.display = 'block';
    // Make contract fields required
    document.getElementById('has-bank-account').required = true;
    document.getElementById('has-showcase-signboard').required = true;
    document.getElementById('has-minimum-area').required = true;
  } else {
    contractFields.style.display = 'none';
    // Make contract fields not required
    document.getElementById('has-bank-account').required = false;
    document.getElementById('has-showcase-signboard').required = false;
    document.getElementById('has-minimum-area').required = false;
  }
}

// Initialize map and location
function initializeMapAndLocation() {
  // Try to get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition(latitude, longitude);
      },
      () => {
        // Fallback to default location and allow manual selection
        document.getElementById('form-message').textContent = 'دسترسی به موقعیت مکانی ممکن نشد. لطفاً مکان را روی نقشه انتخاب کنید.';
        document.getElementById('form-message').style.color = 'orange';
        setMarkerPosition(35.6892, 51.3890); // Default to Tehran
      }
    );
  } else {
    // Browser doesn't support geolocation
    document.getElementById('form-message').textContent = 'مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند. لطفاً مکان را روی نقشه انتخاب کنید.';
    document.getElementById('form-message').style.color = 'orange';
    setMarkerPosition(35.6892, 51.3890); // Default to Tehran
  }

  // Allow manual selection by clicking on the map
  map.on('click', (e) => {
    setMarkerPosition(e.latlng.lat, e.latlng.lng);
  });
}

// Negotiation timestamps
document.getElementById('start-negotiation').addEventListener('click', () => {
  document.getElementById('start-timestamp').textContent = `شروع: ${formatTime()}`;
  // Remove error message if it was showing
  const message = document.getElementById('form-message');
  if (message.textContent.includes('شروع مذاکره')) {
    message.textContent = '';
    message.style.color = '';
  }
});

document.getElementById('end-negotiation').addEventListener('click', () => {
  document.getElementById('end-timestamp').textContent = `پایان: ${formatTime()}`;
  // Remove error message if it was showing
  const message = document.getElementById('form-message');
  if (message.textContent.includes('پایان مذاکره')) {
    message.textContent = '';
    message.style.color = '';
  }
});

// Contract registered change event
document.getElementById('contract-registered').addEventListener('change', handleContractRegisteredChange);

// Marketing area type change event
document.getElementById('marketing-area-type').addEventListener('change', updateMarketingAreaNameOptions);

// Function to read file as Base64
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.readAsDataURL(file);
  });
}

// Function to send vendor data
async function sendVendor(data) {
  const msg = document.getElementById('form-message');
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/vendor/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'خطا در ثبت');

    msg.textContent = 'با موفقیت ثبت شد';
    msg.style.color = 'green';
  } catch (err) {
    msg.textContent = err.message;
    msg.style.color = 'red';
  }
}

// Form submission
document.getElementById('vendor-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Check if user is logged in
  let user;
  try {
    user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      document.getElementById('form-message').textContent = 'وارد نشده‌اید!';
      document.getElementById('form-message').style.color = 'red';
      return;
    }
  } catch {
    document.getElementById('form-message').textContent = 'خطا در اطلاعات کاربر!';
    document.getElementById('form-message').style.color = 'red';
    return;
  }

  // Validation for negotiation timestamps
  const startTimestamp = document.getElementById('start-timestamp').textContent;
  const endTimestamp = document.getElementById('end-timestamp').textContent;
  
  if (!startTimestamp || startTimestamp.trim() === '') {
    document.getElementById('form-message').textContent = 'لطفاً ابتدا دکمه "شروع مذاکره" را بزنید!';
    document.getElementById('form-message').style.color = 'red';
    return;
  }
  
  if (!endTimestamp || endTimestamp.trim() === '') {
    document.getElementById('form-message').textContent = 'لطفاً ابتدا دکمه "پایان مذاکره" را بزنید!';
    document.getElementById('form-message').style.color = 'red';
    return;
  }

  // Collect form data
  const formData = {
    shop_name: document.getElementById('shop-name').value,
    manager_name: document.getElementById('manager-name').value,
    phone_number: document.getElementById('phone-number').value,
    shop_type: document.getElementById('shop-type').value,
    marketing_area_type: document.getElementById('marketing-area-type').value,
    marketing_area_name: document.getElementById('marketing-area-name').value,
    has_valid_license: document.getElementById('has-valid-license').value,
    has_rental_agreement: document.getElementById('has-rental-agreement').value,
    is_first_visit: document.getElementById('is-first-visit').value,
    contract_registered: document.getElementById('contract-registered').value,
    start_time: startTimestamp.replace('شروع: ', '') || '',
    end_time: endTimestamp.replace('پایان: ', '') || '',
    negotiation_result: document.getElementById('negotiation-result').value,
    description: document.getElementById('description').value,
    has_bank_account: document.getElementById('has-bank-account').value || '',
    has_showcase_signboard: document.getElementById('has-showcase-signboard').value || '',
    has_minimum_area: document.getElementById('has-minimum-area').value || '',
    photo: '',
    latitude: document.getElementById('latitude').value,
    longitude: document.getElementById('longitude').value,
    city: document.getElementById('city').value,
    street: document.getElementById('street').value,
    created_by: user.id
  };

  // Handle file upload
  const fileInput = document.getElementById('vendor-image');
  const file = fileInput.files[0];
  try {
    if (file) {
      formData.photo = await readFileAsBase64(file);
    }
    await sendVendor(formData);
  } catch (err) {
    document.getElementById('form-message').textContent = err.message;
    document.getElementById('form-message').style.color = 'red';
  }
});

// Initialize map and location on load
window.onload = initializeMapAndLocation;