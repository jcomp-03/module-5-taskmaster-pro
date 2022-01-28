// empty object
var tasks = {};




// check if the list item element's date is in the past or coming
// due in the near future and style it with Bootstrap classes accordingly
var auditTask = function(taskEl) {
  // get the date stored in the span's text and trim it of spaces
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00pm. In other words, we're taking the
  // value stored in our variable date, which is a string, and creating a
  // moment from it by parsing the string we passed, as well as specifying
  // the locale aware token "L". We use generic set method to set the hours
  // value to 5:00pm (17 in 24-hour time) to establish end of day.
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date. In other words, we're
  // using a query method .isAfter() to check if the current moment is past
  // the date stored in the variable time. If true, color the background red.
  // Also check if the difference between the current moment and the date is
  // absolutely less than 2. If true, color the background yellow.
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};


var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};


var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

// load tasks for the first time. In other words, when this .js
// file is read, run the code in the function loadTask()
loadTasks();


var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


///// Event listeners /////

// task description was clicked. In other words, when the
// event "click" is heard on the <p> element located inside the
// <ul> element with class .list-group, run the event handler 
// function below
$(".list-group").on("click", "p", function() {
  var text = $(this).text();

  // create new <textarea> element, add class and pass text value
  var textInput = $("<textarea>").addClass("form-control").val(text);

  // replace the <p> with the <textarea> element
  $(this).replaceWith(textInput);

  // automatically highlight, or focus, the text area
  textInput.trigger("focus");
});


// user clicked out of <textarea> element. In other words, the
// moment the user interacts with anything outside the text area,
// run the event handler function below
$(".list-group").on("blur", "textarea", function() {
  // get the text area's current value/text
  var text = $(this).val().trim();

  // get the parent ul's id attribute, minus the "list-" portion
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements. In other
  // words, find the closest element with class .list-group-item (so it will
  // will be the <li> element itself). Grab the <li>'s index.
  var index = $(this).closest(".list-group-item").index();

  // In the object tasks, take the value of the variable text
  // and pass it as the value of the text property of the object
  // located at position index in the array status.  
  tasks[status][index].text = text;
  
  saveTasks();

  // recreate <p> element
  var taskP = $("<p>").addClass("m-1").text(text);

  // replace <textarea> with <p> element
  $(this).replaceWith(taskP);
});


// due date was clicked. In other words, when the event "click"
// is heard on the <span> element located inside the <ul> element
// with class .list-group, run the event handler below
$(".list-group").on("click", "span", function() {
  // get current text from the <span> element and trim its value
  var date = $(this).text().trim();

  // create new input element, assign its type, add a class, and pass variable date as its value
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  
  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});


// value of due date was changed. The event type was initially "blur" but
// once the jQuery UI widget datepicker was implemented, the blur event
// had to change into a "change" event
$(".list-group").on("change", "input[type='text']", function() {
  // get current text from the <input> with type = text
  var date = $(this).val().trim();

  // get the parent ul's id attribute, minus the "list-" portion
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements. In other
  // words, find the closest element with class .list-group-item (so it will
  // will be the <li> element itself). Grab the <li>'s index.
  var index = $(this).closest(".list-group-item").index();

  // In the object tasks, take the value of the variable text
  // and pass it as the value of the text property of the object
  // located at position index in the array status.
  tasks[status][index].date = date;
  
  // re-save to local storage once the edit date event has happened
  // and the tasks object has been updated
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);

  // replace <input> with <span> element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});


// modal was triggered. In other words, when the user clicks the green
// Add Task button and the modal appears, clear out the values for the text area
// and the input field 
$("#task-form-modal").on("show.bs.modal", function() {
  console.log('Your event listener fired!');
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});


// modal is fully visible. In other words, when the modal has appeared,
// immediately focus on the text area with id modalTaskDescription
$("#task-form-modal").on("shown.bs.modal", function() {
  $("#modalTaskDescription").trigger("focus");
});


// save button in modal was clicked. In other words, when the user
// clicks on the Save Task button in the modal, create a new task
// and pass the text and date into the function createTask;
// automatically assign it to the toDo list.
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  // if the user entered both a task description and date,
  // create the task, hide the modal, and push the new object
  // to the tasks.toDo array.
  if (taskText && taskDate) {

    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    // run saveTasks() function
    saveTasks();
  }

});


// remove all tasks
$("#remove-tasks").on("click", function() {
  debugger;
  for (var key in tasks) {
    
    tasks[key].length = 0;

    // empty each array: toDo, inProgress, inReview, done
    $("#list-" + key).empty();
  }
  // save these changes to local storage. Saving nothing effectively.
  saveTasks();
});


$(".card .list-group").sortable({
  connectWith: $(".card .list-group")
});

// enable draggable/sortable feature on list-group elements
$(".card .list-group").sortable({
  // enable dragging across lists
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event, ui) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event, ui) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
  },

  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    console.log(tempArr);

    // trim down list's ID to match object property
    var arrName = $(this).attr("id").replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  } 
});

// trash icon can be dropped onto
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    // remove dragged element from the dom
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  over: function(event, ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});

// convert text field into a jquery date picker
$("#modalDueDate").datepicker({
  // force user to select a future date
  minDate: 1,
  dateFormat: "mm/dd/yy",
  showButtonPanel: true,
  closeText: "I'm done"
});


setInterval(function () {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, 1800000);
