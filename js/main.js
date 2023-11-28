// #1 createElemWithText
const createElemWithText = (elemName = "p", text = "", name) => {
  const newElem = document.createElement(`${elemName}`);
  newElem.textContent = text;
  if (name) {
      newElem.classList.add(name);
  }
  return newElem;
};

// #2 createSelectOptions
const createSelectOptions = (jsonData) => {
  if (!jsonData) return;
  const elemArray = [];
  jsonData.forEach(user => {
      const newElem = document.createElement("option");
      newElem.value = user.id;
      newElem.textContent = user.name;
      elemArray.push(newElem);
  });
  return elemArray;
};

// #3 toggleCommentSection
const toggleCommentSection = (postId) => {
  if (!postId) return;
  const elem = document.querySelector(`section[data-post-id='${postId}']`);
  if (elem === null) return null;
  elem.classList.toggle("hide");
  return elem;
};

// #4 toggleCommentButton 
const toggleCommentButton = (postId) => {
  if (!postId) return;
  const button = document.querySelector(`button[data-post-id='${postId}']`);
  if (button === null) return null;
  button.textContent === "Show Comments" ? button.textContent = "Hide Comments" : button.textContent = "Show Comments";
  return button;
};

// #5 deleteChildElements
const deleteChildElements = (parentElement) => {
  if (!parentElement || !(parentElement instanceof HTMLElement)) return;
  let child = parentElement.lastElementChild;
  while (child) {
      parentElement.removeChild(child);
      child = parentElement.lastElementChild;
  }
  return parentElement;
};

// #6 addButtonListeners
const addButtonListeners = () => {
  const main = document.querySelector("main");
  const buttons = main.querySelectorAll("button");
  for (const button of buttons) {
      const postId = button.dataset.postId;
      button.addEventListener("click", function (e) {toggleComments(e, postId)}, false);
  }
  return buttons;
};

// #7 removeButtonListeners
const removeButtonListeners = () => {
  const main = document.querySelector("main");
  const buttons = main.querySelectorAll("button");
  for (const button of buttons) {
      const postId = button.dataset.postId;
      button.removeEventListener("click", function (e) {toggleComments(e, postId)}, false);
  }
  return buttons;
};

// #8 createComments
const createComments = (jsonComments) => {
  if(!jsonComments) return;
  const fragment = document.createDocumentFragment();
  jsonComments.forEach(comment => {
      const article = document.createElement("article");
      const name = createElemWithText('h3', comment.name);
      const body = createElemWithText('p', comment.body);
      const email = createElemWithText('p', `From: ${comment.email}`);
      article.append(name, body, email);
      fragment.append(article);
  });
  return fragment;
};

// #9 populateSelectMenu
const populateSelectMenu = (jsonUsers) => {
  if (!jsonUsers) return;
  const selectMenu = document.getElementById("selectMenu");
  const optionsElemsArray = createSelectOptions(jsonUsers);
  optionsElemsArray.forEach(option => {
      selectMenu.append(option);
  });
  return selectMenu;
};

// #10 getUsers
const getUsers = async () => {
  try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      return await res.json();
  } catch (e) {
      console.error(e);
  }
};

// #11 getUserPosts
const getUserPosts = async (userId) => {
  if (!userId) return;
  try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
      return await res.json();
  } catch (e) {
      console.error(e);
  }
};

// #12 getUser
const getUser = async (userId) => {
  if (!userId) return;
  try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      return await res.json();
  } catch (e) {
      console.error(e);
  }
};

// #13 getPostComments
const getPostComments = async (postId) => {
  if (!postId) return;
  try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
      return await res.json();
  } catch (e) {
      console.error(e);
  }
};

// #14 displayComments
const displayComments = async (postId) => {
  if (!postId) return;
  const section = document.createElement("section");
  section.dataset.postId = postId;
  section.classList.add("comments", "hide");
  const comments = await getPostComments(postId);
  const fragment = createComments(comments);
  section.append(fragment);
  return section;
};

// #15 createPosts
const createPosts = async (jsonPosts) => {
  if (!jsonPosts) return;
  const fragment = document.createDocumentFragment();
  for (const post of jsonPosts) {
      const article = document.createElement("article");
      const title = createElemWithText("h2", post.title);
      const body = createElemWithText("p", post.body);
      const id = createElemWithText("p", `Post ID: ${post.id}`);
      const author = await getUser(post.userId);
      const authorCompany = createElemWithText("p", `Author: ${author.name} with ${author.company.name}`);
      const companyPhrase = createElemWithText("p", author.company.catchPhrase);
      const button = createElemWithText('button', 'Show Comments');
      button.dataset.postId = post.id;
      article.append(title, body, id, authorCompany, companyPhrase, button);
      const section = await displayComments(post.id);
      article.append(section);
      fragment.append(article);
  }
  return fragment;
};

// #16 displayPosts
const displayPosts = async (posts) => {
  const main = document.querySelector("main");
  const element = posts ? await createPosts(posts) : main.querySelector('p[class=default-text]');
  main.append(element);
  return element;
};

// #17 toggleComments
const toggleComments = (event, postId) => {
  if (!event || !postId) return;
  event.target.listener = true;
  const elem = toggleCommentSection(postId);
  const button = toggleCommentButton(postId);
  const array = [elem, button];
  return array;
};

// #18 refreshPosts
const refreshPosts = async (jsonPosts) => {
  if (!jsonPosts) return;
  const removeButtons = removeButtonListeners();
  const main = deleteChildElements(document.querySelector("main"));
  const fragment = await displayPosts(jsonPosts);
  const addButtons = addButtonListeners();
  return [removeButtons, main, fragment, addButtons];
};

// #19 selectMenuChangeEventHandler
const selectMenuChangeEventHandler = async (event) => {
  if (!event) return;
  const selectMenu = document.getElementById("selectMenu");
  selectMenu.setAttribute('disabled', '');
  const userId = event?.target?.value || 1;
  const jsonPostsData = await getUserPosts(userId);
  const refreshPostsArray = await refreshPosts(jsonPostsData);
  selectMenu.removeAttribute('disabled');
  return [userId, jsonPostsData, refreshPostsArray];
};

// #20 initPage
const initPage = async () => {
  const jsonUsersData = await getUsers();
  const selectElement = populateSelectMenu(jsonUsersData);
  return [jsonUsersData, selectElement];
};

// #21 initApp
const initApp = () => {
  initPage();
  const selectMenu = document.getElementById("selectMenu");
  selectMenu.addEventListener("change", selectMenuChangeEventHandler, false);
};

document.addEventListener("DOMContentLoaded", initApp, false);
