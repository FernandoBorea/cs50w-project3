document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(false));

  // Add event listener for email form submission
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(use_prefill, prefill) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields or prefill values
  if (!use_prefill) {
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  } else {
    document.querySelector('#compose-recipients').value = prefill.recipients;

    subject = prefill.subject;
    subject = (subject.length < 3 || subject.slice(0, 4) !== "Re: ")? `Re: ${subject}` : subject;
    document.querySelector('#compose-subject').value = subject;

    body = `\n\nOn ${prefill.timestamp} ${prefill.sender} wrote:\n${prefill.body}`;
    document.querySelector('#compose-body').value = body;
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails
  fetch(`/emails/${mailbox}`)
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
      email_a_element.addEventListener('click', () => show_email(email.id, mailbox));

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

function show_email(email_id, mailbox) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Clear out HTML of previous email
  document.querySelector('#email-view').innerHTML = '';

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

    receiver_title = document.createElement('p');
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
    timestamp.className = 'card-subtitle text-muted';
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

    // Archive button
    if (mailbox != 'sent') {

      // Prepare text
      archive_text = email.archived? 'Move to inbox' : 'Move to archive';
      
      // Prepare elements
      button = document.createElement('button');
      button.className = 'btn btn-sm btn-outline-primary mt-2';
      button.innerHTML = archive_text;

      button.addEventListener('click', () => archiver(email));

      // Add to header
      email_header.append(button);
    }

    // Body elements
    email_body = document.createElement('div');
    email_body.className = 'card-body';

    email_content = document.createElement('p');
    email_content.className = 'card-text';
    email_content.innerHTML = email.body.replace(new RegExp('\n', 'g'),'<br>');

    // Build body
    email_body.append(email_content)

    // Card footer elements
    footer_div = document.createElement('div');
    footer_div.className = 'card-footer';

    button = document.createElement('button');
    button.className = 'btn btn-sm btn-primary mt-2';
    button.innerHTML = 'Reply to this email';

    prefill = {
      recipients: email.sender,
      subject: email.subject,
      body: email.body,
      timestamp: email.timestamp,
      sender: email.sender
    }

    button.addEventListener('click', () => compose_email(true, prefill));

    // Build footer
    footer_div.append(button);

    // Build email card
    email_card = document.querySelector('#email-view');
    email_card.append(email_header);
    email_card.append(email_body);
    email_card.append(footer_div);

    // Mark email as read
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    });

  });

  // Prevent default behavior
  return false
}

function archiver(email) {

  // Archive or unarchive email
  if (!email.archived) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    });
  } else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    });
  }

  // Load inbox
  load_mailbox('inbox');
  
}