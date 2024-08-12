// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Get references to the form and its elements
const registrationForm = document.querySelector('#registration .form');
const nameInput
    = registrationForm.querySelector('input[name="name"]');
const emailInput = registrationForm.querySelector('input[name="email"]');
const phoneInput = registrationForm.querySelector('input[name="phone"]');
const departmentSelect = registrationForm.querySelector('.nice-select:first-of-type'); // Assuming first nice-select is Department
const doctorSelect = registrationForm.querySelector('.nice-select:last-of-type');    // Assuming last nice-select is Doctor
const dateInput = registrationForm.querySelector('#datepicker');
const messageTextarea = registrationForm.querySelector('textarea[name="message"]');

// Input Filtering Functions
function filterName(name) {
    // Basic filtering: trim whitespace and allow only letters and spaces
    return name.trim().replace(/[^a-zA-Z\s]/g, '');
}

function filterEmail(email) {
    // Basic email format validation (not foolproof, but a good start)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email.trim() : '';
}

function filterPhone(phone) {
    // Basic filtering: allow only digits and dashes
    return phone.trim().replace(/[^0-9-]/g, '');
}

// Form Submission Handler
registrationForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get and filter input values
    const name = filterName(nameInput.value);
    const email = filterEmail(emailInput.value);
    const phone = filterPhone(phoneInput.value);
    const department = departmentSelect.querySelector('.current').textContent;
    const doctor = doctorSelect.querySelector('.current').textContent;
    const date = dateInput.value;
    const message = messageTextarea.value;

    // Basic validation (you'll likely want to add more robust checks)
    if (!name || !email || !phone || !date) {
        alert("Please fill in all required fields.");
        return;
    }

    // Simulate Firestore submission (replace with actual Firestore logic)
    const formData = {
        name,
        email,
        phone,
        department,
        doctor,
        date,
        message
    };

    console.log("Form data to be submitted to Firestore:", formData);

    // Add data to Firestore
    db.collection("registrations").add(formData)
        .then(() => {
            // Success: Provide feedback to the user and reset the form
            alert("Registration submitted successfully!");
            registrationForm.reset();
        })
        .catch((error) => {
            // Error: Handle the error and inform the user
            console.error("Error adding document: ", error);
            alert("An error occurred during registration. Please try again later.");
        });

    // Optionally, provide feedback to the user
    alert("Registration submitted successfully!");
    registrationForm.reset(); // Clear the form
});