document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form"),
    taskInput = document.getElementById("taskInput"),
    tasksList = document.getElementById("tasksList"),
    btns = document.querySelector(".btns"),
    emptyList = document.getElementById("emptyList"),
    emptyListTitle = document.querySelector(".empty-list__title"),
    openModalBtn = document.querySelector(".btn-open-modal"),
    modal = document.querySelector(".modal-task"),
    overlay = document.querySelector(".overlay"),
    container = document.querySelector(".container"),
    modalDelete = document.querySelector(".modal-delete"),
    modalDeleteSpan = document.querySelector(".modal-delete-span"),
    modalDeleteBtn = document.querySelector('[data-action="remove"]'),
    modalCancelBtn = document.querySelectorAll('[data-action="cancel"]'),
    removeDoneTasksBtn = document.querySelector("#removeDoneTasks"),
    modalDone = document.querySelector(".modal-done"),
    modalDoneSpan = modalDone.querySelector(".modal-done-span"),
    modalComments = document.querySelector(".modal-comments"),
    modalCommentsAdd = document.querySelector(".modal-comments__add"),
    modalCommentsItems = document.querySelector(".modal-comments__items"),
    modalCommentsInput = document.querySelector(".modal-comments__input"),
    modalCommentsTitle = document.querySelector(".modal-comments__title"),
    modalCommentsContent = document.querySelector('.modal-comments__content'),
    completedTasksBlock = document.querySelector(".completed-tasks-block"),
    completedTasksArrow = document.querySelector(".completed-tasks-arrow"),
    completedTasksLists = document.querySelector(".completed-tasks-lists"),
    completedTasksCount = document.querySelector(".completed-tasks-count"),
    emptyTrashBtn = document.querySelector(".completed-tasks-empty"),
    modalTrash = document.querySelector(".modal-trash"),
    headerTime = document.querySelector(".header__time"),
    loader = document.querySelector(".loader"),
    checkbox = document.getElementById("checkbox"),
    headerNumberTasks = document.querySelector(".header__number-tasks span"),
    clearBtn = document.querySelector('[data-action="clear"]');
  
  let tasks = [],
    completedTasks = [];
  if (localStorage.getItem("tasks"))
    tasks = JSON.parse(localStorage.getItem("tasks"));
  if (localStorage.getItem("completedTasks"))
    completedTasks = JSON.parse(localStorage.getItem("completedTasks"));
  tasks.forEach((task) => renderTask(task));
  completedTasks.forEach((task) => renderCompletedTask(task));
  updateEmpty();

  form.addEventListener("submit", addTask);
  tasksList.addEventListener("click", deleteTask);
  tasksList.addEventListener("click", doneTask);
  tasksList.addEventListener("click", openModalComments);
  openModalBtn.addEventListener("click", openModal);
  overlay.addEventListener("click", closeModal);
  modalCancelBtn.forEach((item) => item.addEventListener("click", closeModal));
  removeDoneTasksBtn.addEventListener("click", removeDoneTasks);
  completedTasksBlock.addEventListener("click", completedTasksUp);
  emptyTrashBtn.addEventListener("click", emptyTrash);
  completedTasksLists.addEventListener("click", returnTasks);
  modalComments.addEventListener('click', editDoneComments);
  window.document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("overlay-active"))
      closeModal();
  });
  // window.onload = function () {
  //     window.setTimeout(() => {
  //         loader.classList.remove('loader-active');
  //         container.classList.add('container-animation');
  //         setTimeout(() => {
  //             document.querySelector('.body').classList.remove('body-hidden');
  //             loader.style.display = 'none';
  //         }, 400)
  //     }, 1000)
  // }
  // setInterval(() => {
    let now = new Date();
    headerTime.innerHTML = `${now.toLocaleDateString()}  `;
  // }, 1000);

  function addTask(e) {
    e.preventDefault();
    const newTask = {
      id: Date.now(),
      text: taskInput.value,
      done: false,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      comments: [],
    };
    function pushTasks() {
      tasks.push(newTask);
      renderTask(newTask);
      taskInput.value = "";
      updateEmpty();
      updateLocalStorage();
    }
    if (checkbox.checked) {
      pushTasks();
      taskInput.focus();
    } else {
      pushTasks();
      closeModal();
    }
  }
  function deleteTask(e) {
    if (e.target.dataset.action !== "delete") return;
    disableScroll();
    let parentNode = e.target.closest(".list-group-item");
    let id = +parentNode.id;
    const spanText = parentNode.children[0].textContent;
    modalDeleteSpan.innerHTML = `${spanText}`;
    overlay.classList.add("overlay-active");
    modalDelete.classList.add("modal-delete-active");
    modalDeleteBtn.addEventListener(
      "click",
      (e) => {
        tasks = tasks.filter((task) => task.id !== id);
        parentNode.classList.add("list-group-item-delete");
        setTimeout(() => {
          parentNode.remove();
          updateEmpty();
        }, 500);
        closeModal();
        updateLocalStorage();
      },
      { once: true }
    );
    transition("-50%");
  }
  function doneTask(e) {
    if (e.target.dataset.action === "done") {
      const parentNode = e.target.closest(".list-group-item");
      const id = +parentNode.id;
      const task = tasks.find((task) => task.id === id);
      task.done = !task.done;
      parentNode.children[0].classList.toggle("task-title--done");
      if (parentNode.children[0].classList.contains("task-title--done")) {
        modalDone.classList.add("modal-done-active");
        modalDoneSpan.textContent = parentNode.children[0].textContent;
        document.querySelectorAll(".task-item__buttons").forEach((item) => {
          item.style.pointerEvents = "none";
        });
        removeDoneTasksBtn.style.pointerEvents = "none";
        setTimeout(() => {
          modalDone.classList.remove("modal-done-active");
          document.querySelectorAll(".task-item__buttons").forEach((item) => {
            item.style.pointerEvents = "";
          });
          removeDoneTasksBtn.style.pointerEvents = "";
        }, 2000);
      }
    }
    updateLocalStorage();
  }
  function updateEmpty() {
    if (tasks.length === 0) {
      emptyListTitle.textContent = "Список задач пуст";
      emptyList.classList.remove("none");
    } else if (tasks.length === 1) {
      emptyListTitle.textContent = "Добавьте еще задач в свой список";
      emptyList.classList.remove("none");
    } else if (tasks.length > 1) {
      emptyList.classList.add("none");
    } else {
      emptyList.classList.remove("none");
    }
    completedTasksCount.textContent = completedTasks.length;
    headerNumberTasks.innerHTML = `${tasks.length}`;
    if (completedTasks.length >= 1) {
      completedTasksBlock.classList.add("completed-tasks-block-active");
    } else if (completedTasks.length === 0) {
      completedTasksBlock.classList.remove("completed-tasks-block-active");
      completedTasksLists.classList.remove("completed-tasks-lists-active");
    }
    if (window.screen.width <= 768) {
      openModalBtn.innerHTML = `<img src="./img/add.svg" width="20px" height="20px">`;
      document.querySelectorAll(".return-task").forEach((item) => {
        item.innerHTML = `<img src="./img/return.png" width="20px" height="20px">`;
      });
    } else if (window.screen.width >= 769) {
      openModalBtn.innerHTML = `Добавить задачу`;
      document.querySelectorAll(".return-task").forEach((item) => {
        item.innerHTML = `Вернуть задачу`;
      });
    }
   
  }
  function openModal() {
    checkbox.checked = false;
    modal.classList.add("modal-task-active");
    overlay.classList.add("overlay-active");
    setTimeout(() => {
      taskInput.focus();
    }, 200);
    disableScroll();
    transition("-50%");
  }
  function closeModal() {
    overlay.classList.remove("overlay-active");
    if (modalDelete.classList.contains("modal-delete-active"))
      modalDelete.classList.remove("modal-delete-active");
    if (modal.classList.contains("modal-task-active"))
      modal.classList.remove("modal-task-active");
    if (modalTrash.classList.contains("modal-trash-active"))
      modalTrash.classList.remove("modal-trash-active");
    if (modalComments.classList.contains("modal-comments-active"))
      modalComments.classList.remove("modal-comments-active");
    enableScroll();
    transition("10px");
  }
  function removeDoneTasks(e) {
    let newCompletedTasks = tasks.filter((task) => task.done);
    tasks = tasks.filter((task) => !task.done);
    for (let i = 0; i < newCompletedTasks.length; i++) {
      completedTasks.push(newCompletedTasks[i]);
    }
    document.querySelectorAll(".task-title").forEach((item) => {
      if (item.classList.contains("task-title--done")) {
        const tasksHTML = `<li id="${item.parentNode.id}" class="completed-tasks-list  list-group-item d-flex justify-content-between task-item">
          <span class="task-title" data-action='task-title'> ${item.parentNode.textContent} </span>
          <div class="task-item__buttons">
              <button type="button" data-action="done" class="btn-action return-task">
                  Вернуть задачу
              </button> </div>  </li>`;
        item.parentNode.remove();
        completedTasksLists.insertAdjacentHTML("afterbegin", tasksHTML);
        updateLocalStorage();
        updateEmpty();
      }
    });
  }
  function updateLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }
  function renderTask(task) {
    const cssClass = task.done ? "task-title task-title--done" : "task-title";
    const taskHTML = `<li id="${task.id}" class="list-group-item d-flex justify-content-between task-item">
        <span class="${cssClass}" data-action='task-title'> ${task.text}  </span>
        <div class="task-item__buttons">
            <button type="button" data-action="done" class="btn-action">
                <img src="./img/tick.svg" alt="Done" width="18" height="18">
            </button>
            <button id="btn-delete" type="button" data-action="delete" class="btn-action">
                <img src="./img/cross.svg" alt="Done" width="18" height="18">
            </button>
        </div>
        </li>`;
    tasksList.insertAdjacentHTML("beforeend", taskHTML);
  }
  function renderCompletedTask(task) {
    const tasksHTML = `<li id="${task.id}" class="completed-tasks-list list-group-item d-flex justify-content-between task-item">
          <span class="task-title" data-action='task-title'> ${task.text} </span>
          <div class="task-item__buttons">
              <button type="button" data-action="done" class="btn-action return-task">
                  Вернуть задачу
              </button>
          </div>
          </li>`;
    completedTasksLists.insertAdjacentHTML("afterbegin", tasksHTML);
  }
  function disableScroll() {
    let paddingOffset = window.innerWidth - document.body.offsetWidth + "px";
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = paddingOffset;
  }
  function enableScroll() {
    document.body.style.paddingRight = 0;
    document.body.style.overflow = "";
  }
  function transition(value) {
    btns.style.bottom = `${value}`;
  }
  function completedTasksUp() {
    completedTasksArrow.classList.toggle("rotate");
    completedTasksLists.classList.toggle("completed-tasks-lists-active");
  }
  function returnTasks(e) {
    if (e.target.dataset.action !== "done") return;
    const parentNode = e.target.parentNode.parentNode;
    let id = +parentNode.id;
    let newCompletedTasks = completedTasks.filter((task) => task.id === id);
    const task = newCompletedTasks.find((task) => task.id === id);
    task.done = !task.done;
    for (let i = 0; newCompletedTasks.length > i; i++) { tasks.push(newCompletedTasks[i]) }
    completedTasks = completedTasks.filter((task) => task.id !== id);
    const taskHTML = `<li id="${parentNode.id}" class="list-group-item d-flex justify-content-between task-item">
    <span class="task-title" data-action='task-title'> ${parentNode.children[0].textContent}  </span>
    <div class="task-item__buttons">
        <button type="button" data-action="done" class="btn-action">
            <img src="./img/tick.svg" alt="Done" width="18" height="18">
        </button>
        <button id="btn-delete" type="button" data-action="delete" class="btn-action">
            <img src="./img/cross.svg" alt="Done" width="18" height="18">
        </button>
    </div>
    </li>`;
    tasksList.insertAdjacentHTML("beforeend", taskHTML);
    parentNode.remove();
    updateLocalStorage();
    updateEmpty();
  }
  function emptyTrash(e) {
    modalTrash.classList.add("modal-trash-active");
    overlay.classList.add("overlay-active");
    transition("-50%");
    disableScroll();
    clearBtn.addEventListener("click",() => {
        completedTasks = [];
        document.querySelectorAll(".completed-tasks-list").forEach((item) => item.remove());
        updateLocalStorage();
        updateEmpty();
        closeModal();
      },{ once: true }
    );
  }
  function openModalComments(e) {
    if (e.target.dataset.action !== "task-title") return;
    overlay.classList.add("overlay-active");
    document.querySelector(".modal-comments").classList.add("modal-comments-active");
    let id = +e.target.parentNode.id;
    let eventTarget = e.target;
    const newTasks = tasks.find((item) => item.id === id);
    document.querySelector(".modal-comments__title").value = `${e.target.textContent.trim()}`;
    document.querySelector(".modal-comments__date").textContent = `${newTasks.date}`;
    document.querySelector(".modal-comments__time").textContent = `${newTasks.time}`;
    renderComments(id);
    submitForm(id);
    disableScroll();
    transition("-50%");
    trackingAddInput();
    trackingEditTitle(id, eventTarget);
    doneComments(id);
    editComments(id);
  }
  function submitForm(id) {
    modalCommentsAdd.onclick = function (e) {
      e.preventDefault();
      if (modalCommentsInput.value.length === 0) {
        modalCommentsInput.focus();
        return;
      }
      modalCommentsInput.style.outline = "";
      let findIndexTasks = tasks.findIndex((item) => item.id === id);
      tasks.forEach((item) => {
        if (item.id === id) {
          let newComments = {
            id: Date.now(),
            text: modalCommentsInput.value,
            done: false,
          };
          tasks[findIndexTasks].comments.push(newComments);
          renderComments(id);
        }
      });
      modalCommentsAdd.style.background = "#fff";
      modalCommentsInput.focus();
      modalCommentsInput.value = '';
      updateLocalStorage();
    }
  }
  function trackingAddInput() {
    modalCommentsInput.addEventListener("input", (e) => {
      if (e.target.value.length >= 1) {
        modalCommentsAdd.style.background = "green";
      } else if (e.target.value.length === 0) {
        modalCommentsAdd.style.background = "#fff";
      }
    });
  }
  function trackingEditTitle(id, eventTarget) {
    modalCommentsTitle.onchange = function (e) {
      tasks.map((item) => {
        if (item.id === id) {
          if (e.target.value.length === 0) { 
            item.text = item.text;
            eventTarget.textContent = item.text;
            console.log(eventTarget)
          } else {
            item.text = `${e.target.value}`;
            eventTarget.textContent = `${e.target.value}`;
          }
        }
      });
      updateLocalStorage();
    };
  }
  function renderComments(id) {
    document.querySelectorAll(".modal-comments__item").forEach((item) => item.remove());
    tasks.forEach((item) => {
      if (item.id === id) {
        if (item.comments.length === 0) {
          return;
        } else {
          item.comments.forEach((item) => {
            const cssClass = item.done ? "modal-comments__comment  comments-done" : 'modal-comments__comment';
            const ccsClassSvg = item.done ? 'modal-comments__svg modal-comments__svg-active' : 'modal-comments__svg';
            const modalEditClass = item.done ? 'modal-comments__edit pe' : 'modal-comments__edit';
            let newItem = `
            <li id="${item.id}" class="modal-comments__item">
              <div class="${ccsClassSvg}" data-action="modal-comments-svg" data-action="modal-comments-svg">
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.29999 1.20001L3.79999 6.70001L1.29999 4.20001" stroke="red" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <input maxlength="60" value="${item.text}" class="${cssClass}" disabled="true"></input>
              <div class="modal-comments__btns">
                <button data-action="modal-comments-edit" class="${modalEditClass}">
                  <svg  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.4745 5.40801L18.5917 7.52524M17.8358 3.54289L12.1086 9.27005C11.8131 9.56562 11.6116 9.94206 11.5296 10.3519L11 13L13.6481 12.4704C14.0579 12.3884 14.4344 12.1869 14.7299 11.8914L20.4571 6.16423C21.181 5.44037 21.181 4.26676 20.4571 3.5429C19.7332 2.81904 18.5596 2.81903 17.8358 3.54289Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 15V18C19 19.1046 18.1046 20 17 20H6C4.89543 20 4 19.1046 4 18V7C4 5.89543 4.89543 5 6 5H9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button data-action="modal-comments-redact" class="modal-comments__redact none" >
                  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path fill="none" fill-rule="evenodd" d="M4,4 L9,4 C9.55228,4 10,3.55228 10,3 C10,2.44772 9.55228,2 9,2 L4,2 C2.89543,2 2,2.89543 2,4 L2,12 C2,13.1046 2.89543,14 4,14 L12,14 C13.1046,14 14,13.1046 14,12 L14,10 C14,9.44771 13.5523,9 13,9 C12.4477,9 12,9.44771 12,10 L12,12 L4,12 L4,4 Z M15.2071,2.29289 C14.8166,1.90237 14.1834,1.90237 13.7929,2.29289 L8.5,7.58579 L7.70711,6.79289 C7.31658,6.40237 6.68342,6.40237 6.29289,6.79289 C5.90237,7.18342 5.90237,7.81658 6.29289,8.20711 L7.79289,9.70711 C7.98043,9.89464 8.23478,10 8.5,10 C8.76522,10 9.01957,9.89464 9.20711,9.70711 L15.2071,3.70711 C15.5976,3.31658 15.5976,2.68342 15.2071,2.29289 Z"/>
                  </svg>
                </button>
                <button data-action='modal-comments-delete' class='modal-comments__delete' >
                <svg viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title>remove-comment</title>
                <path class="clr-i-outline clr-i-outline-path-1" d="M19.61,18l4.86-4.86a1,1,0,0,0-1.41-1.41L18.2,16.54l-4.89-4.89a1,1,0,0,0-1.41,1.41L16.78,18,12,22.72a1,1,0,1,0,1.41,1.41l4.77-4.77,4.74,4.74a1,1,0,0,0,1.41-1.41Z"></path><path class="clr-i-outline clr-i-outline-path-2" d="M18,34A16,16,0,1,1,34,18,16,16,0,0,1,18,34ZM18,4A14,14,0,1,0,32,18,14,14,0,0,0,18,4Z"></path>
                <rect x="0" y="0" width="36" height="36" fill-opacity="0"/>
                </svg>
                </button>
              </div>
            </li>
            `;
            modalCommentsItems.insertAdjacentHTML("beforeend", newItem);
          });
        }
      }
    });
    updateLocalStorage();
  }
  modalCommentsContent.addEventListener("touchstart", handleTouchStart, false);
  modalCommentsContent.addEventListener("touchmove", handleTouchMove, false);
  let xDown = null;
  let yDown = null;
  function getTouches(evt) {
    return evt.touches || evt.originalEvent.touches;
  }
  function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }
  function handleTouchMove(evt) {
    if (!xDown || !yDown) return;
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff >= 10) {
        closeModal();
      }
    }
    xDown = null;
    yDown = null;
  }
  function doneComments(id) {
    modalComments.onclick = function (e) {
      if (e.target.dataset.action !== 'modal-comments-svg') return;
      e.target.classList.toggle('modal-comments__svg-active');
      e.target.parentNode.children[1].classList.toggle('comments-done');
      const parentNode = e.target.parentNode;
      const idComment = +e.target.parentNode.id;
      tasks.forEach(item => {
        if (item.id === id) {
          item.comments.forEach(item => {
            if (item.id === idComment) item.done = !item.done;
          })
        }
      })
      parentNode.children[2].children[0].classList.toggle('pe');
      updateLocalStorage();
    }
  }
  function editComments(id) {
    modalComments.addEventListener('click', (e) => {
      if (e.target.dataset.action !== 'modal-comments-edit') return;
      document.querySelectorAll('.modal-comments__comment').forEach(item => item.disabled = true);
      document.querySelectorAll('.modal-comments__edit').forEach(item => item.classList.remove('none'));
      document.querySelectorAll('.modal-comments__redact').forEach(item => item.classList.add('none'));
      const parentNode = e.target.parentNode.parentNode.children[1];
      const parentNodeChildren = e.target.parentNode.children[1];
      const eTarget = e.target;
      eTarget.classList.add('none');
      parentNodeChildren.classList.remove('none');
      parentNode.disabled = false;
      parentNode.focus();
      parentNode.setSelectionRange(parentNode.value.length, parentNode.value.length);
      parentNode.onchange = function (e) {
        let value = e.target.value;
        let id = +eTarget.parentNode.parentNode.id;
        tasks.map((item) => {
          item.comments.forEach(item => {
            if (item.id === id) {
              item.text = value;
            }
          })  
          
        });
        updateLocalStorage()
      }
    })
  }
  function editDoneComments(e) {
    if (e.target.dataset.action !== 'modal-comments-redact') return;
    e.target.classList.add('none');
    e.target.parentNode.children[0].classList.remove('none');
    e.target.parentNode.parentNode.children[1].disabled = true;
  }
  
});