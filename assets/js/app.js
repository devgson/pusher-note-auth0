const textSyncInstance = new TextSync({
  instanceLocator: 'v1:us1:27293868-2246-4359-baa9-0ff2a8fe02ce',
});

const docID = document.URL.slice(document.URL.lastIndexOf('/') + 1);

const editor = textSyncInstance.createEditor({
  docId: docID,
  element: '#text_editor',
  cursorLabelsAlwaysOn: true,
  authEndpoint: 'https://push-note-collab.herokuapp.com/textsync/tokens',
  userName: user,

  onCollaboratorsJoined: (users) => {
    const activeUsers = document.querySelector('.active_users ul');
    users.forEach((value) => {
      activeUsers.insertAdjacentHTML('beforeend', `<li id='${value.siteId}'>${value.name}</li>`);
    })
  },

  onCollaboratorsLeft: (users) => {
    const activeUsers = document.querySelectorAll('.active_users ul li');
    users.forEach((value) => {
      activeUsers.forEach((element) => {
        if (element.id === value.siteId) element.remove();
      })
    })
  }
});
