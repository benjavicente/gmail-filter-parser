import { zip, map, getRequests } from "./helpers.js";
import { parse } from "./parser.js";

document.addEventListener("DOMContentLoaded", init);

function init() {
  // Gist form
  const submit_button = document.getElementById("gist_form");
  submit_button.onsubmit = sumbit_gist_form;
  // Filter fields
  const fields = document.getElementsByClassName("filter_input");
  for (let field of fields) {
    field.onkeydown = check_input;
    field.addEventListener("input", check_syntax_onchange);
  }
  // Request
  const request = getRequests();
  if ("gist" in request) {
    load_gist(request.gist);
  } else if ("f" in request) {
    const field = document.getElementsByClassName("filter_input")[0];
    field.innerText = decodeURI(request.f);
    check_syntax(field);
  }
}

function sumbit_gist_form(event) {
  event.preventDefault();
  const input = document.getElementById("gist_input");
  if (input.checkValidity()) {
    load_gist(input.value);
    input.value = null;
  }
}

async function fetch_gist_files(id) {
  const response = await fetch(`https://api.github.com/gists/${id}`);
  if (response.ok) {
    const gists = await response.json();
    return map(Object.keys(gists.files), (k) => gists.files[k].content);
  } else {
    return [];
  }
}

function load_gist(id) {
  fetch_gist_files(id).then((files) => {
    const fields = document.getElementsByClassName("filter_input");
    for (let [field, file] of zip(fields, files)) {
      field.innerText = file;
      check_syntax(field);
    }
  });
}

function check_syntax_onchange(event) {
  check_syntax(event.target);
}

function check_syntax(input_box) {
  const out_box = input_box.parentElement.getElementsByClassName("filter_output")[0];
  const errors_box = out_box.getElementsByClassName("filter_errors")[0];
  const result_box = out_box.getElementsByClassName("filter_result")[0];
  const result = parse(input_box.innerText);
  while (result_box.lastChild) {
    result_box.removeChild(result_box.lastChild);
  }
  if (result.parserErrors.length == 0) {
    errors_box.textContent = null;
    add_result(result_box, result.value);
  } else {
    errors_box.textContent = result.parserErrors;
  }
}

function check_input(event) {
  const field = event.target;
  const selection = window.getSelection();
  if (event.key == "Tab") {
    if (selection.baseOffset == selection.focusOffset) {
      // TODO: add spaces
    }
    event.preventDefault();
  }
}

function add_result(box, elements) {
  for (let element of elements) {
    let element_box = document.createElement("div");
    element_box.classList.add("element");

    if (typeof element === "string") {
      element_box.textContent = element;
    } else if (element.type.match(/group_?[a-z]*$/)) {
      let title_box = document.createElement("div");
      title_box.textContent = "Group";
      element_box.appendChild(title_box);

      let sub_elements = document.createElement("div");
      add_result(
        sub_elements,
        Array.isArray(element.elements) ? element.elements : [element.elements]
      );
      element_box.appendChild(sub_elements);

      if (element.except) {
        let sub_except = document.createElement("div");
        sub_except.textContent = "Except:";
        sub_except.classList.add("element");
        element_box.appendChild(sub_except);
        let sub_except_elements = document.createElement("div");
        if (!Array.isArray(element.except)) {
          // Iterable for recursion
          element.except = [element.except];
        }
        add_result(sub_except_elements, element.except);
        sub_except.appendChild(sub_except_elements);
      }
    } else if (element.type.match(/key_value/)) {
      let title_box = document.createElement("div");
      title_box.textContent = `Match emails ${element.key}:`;
      element_box.appendChild(title_box);

      let sub_elements_box = document.createElement("div");
      if (element.value) {
        add_result(sub_elements_box, element.value);
      } else {
        sub_elements_box.textContent.element;
      }
      element_box.appendChild(sub_elements_box);
    }

    box.appendChild(element_box);
  }
}
