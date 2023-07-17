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
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
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
      // email_a_element.href = '#';
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

      // Add event listener
      email_a_element.addEventListener('click', () => show_email(email.id));

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

function show_email(email_id) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Get email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

    // Log email
    console.log(email);

    // Header elements
    email_header = document.createElement('div');
    email_header.className = 'card-header';

    sender_div = document.createElement('div');
    sender_div.className = 'd-flex w-100';

    sender_title = document.createElement('p');
    sender_title.className = 'font-weight-bold';
    sender_title.innerHTML = 'From: &nbsp;';

    sender_email = document.createElement('p');
    sender_email.className = 'card-text';
    sender_email.innerHTML = email.sender;

    receiver_div = document.createElement('div');
    receiver_div.className = 'd-flex w-100';

    receiver_title = document.createElement('h6');
    receiver_title.className = 'font-weight-bold';
    receiver_title.innerHTML = 'To: &nbsp;';

    receiver_email = document.createElement('p');
    receiver_email.className = 'card-text';
    receiver_email.innerHTML = email.recipients;

    subject_div = document.createElement('div');
    subject_div.className = 'd-flex w-100';

    subject_title = document.createElement('p');
    subject_title.className = 'mb-3 font-weight-bold';
    subject_title.innerHTML = 'Subject: &nbsp;';

    subject_content = document.createElement('p');
    subject_content.className = 'card-text';
    subject_content.innerHTML = email.subject;

    timestamp = document.createElement('p');
    timestamp.className = 'card-subtitle text-muted font-weight-bold';
    timestamp.innerHTML = `On ${email.timestamp}`;

    // Build header
    sender_div.append(sender_title);
    sender_div.append(sender_email);

    receiver_div.append(receiver_title);
    receiver_div.append(receiver_email);

    subject_div.append(subject_title);
    subject_div.append(subject_content);

    email_header.append(sender_div);
    email_header.append(receiver_div);
    email_header.append(subject_div);
    email_header.append(timestamp);

    // Body elements
    email_body = document.createElement('div');
    email_body.className = 'card-body';

    email_content = document.createElement('p');
    email_content.className = 'card-text';
    email_content.innerHTML = email.body;

    // Build body
    email_body.append(email_content)

    // Build email card
    email_card = document.querySelector('#email-view');
    email_card.append(email_header);
    email_card.append(email_body);
  });

  // Prevent default behavior
  return false
}