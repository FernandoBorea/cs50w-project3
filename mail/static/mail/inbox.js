document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Add event listener for email form submission
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    // Log emails to console
    console.log(emails);

    // Iterate on emails
    emails.forEach(email => {

      // Create email anchor element
      email_a_element = document.createElement('a');
      email_a_element.className = !email.read? 'list-group-item list-group-item-action' : 'list-group-item list-group-item-action read';
      email_a_element.href = '#';
      email_a_element.id = email.id;

      // Create email div
      email_div_element = document.createElement('div');
      email_div_element.className = 'd-flex w-100 justify-content-between';

      // Create email div elements
      email_sender = document.createElement('h5');
      email_sender.innerHTML = email.sender;

      email_subject = document.createElement('h6');
      email_subject.innerHTML = email.subject;

      email_timestamp = document.createElement('small');
      email_timestamp.innerHTML = email.timestamp;

      // Build email div
      email_div_element.append(email_sender);
      email_div_element.append(email_subject);
      email_div_element.append(email_timestamp);

      // Build anchor element
      email_a_element.append(email_div_element);

      // Append to email view
      document.querySelector('#emails-view').append(email_a_element);
    })
  });
}

function send_email () {
  
  // Get the elements of the email
  recipients = document.querySelector('#compose-recipients').value;
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;

  // Send POST request for email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then (response => response.json())
  .then (result => console.log(result));

  // Load inbox
  load_mailbox('inbox');

  // Prevent default behavior
  return false;

}