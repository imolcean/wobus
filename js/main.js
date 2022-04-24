const api = "https://v5.bvg.transport.rest";

// Show departures for how many minutes?
const duration = 60;

const container = document.getElementById("main");

const interest = [
  {
    name: "Britzer Str.",
    id: 900000192504,
    list: document.getElementById("list-britzer-str"),
  },
  {
    name: "S Schöneweide",
    id: 900000192001,
    list: document.getElementById("list-schoeneweide"),
  },
  {
    name: "S+U Hauptbahnhof",
    id: 900000003201,
    list: document.getElementById("list-hbf"),
  },
];

/**
 * Extracts relevant information for the trip.
 *
 * @param trip Single trip
 */
function parse(trip) {
  return {
    product: trip.line.productName,
    name: trip.line.name,
    direction: trip.direction,
    time: trip.plannedWhen,
    delay: trip.delay
  };
}

/**
 * Takes datetime value and returns a label to be rendered.
 *
 * @param timestamp Datetime
 */
function timeLabel(timestamp) {
  return new Date(timestamp).toLocaleTimeString(undefined, {hour: "numeric", minute: "numeric"});
}

/**
 * Takes delay value and returns a label to be rendered (can be empty).
 *
 * @param sec Delay value (in seconds)
 */
function delayLabel(sec) {
  if (sec === undefined || sec === null)
    return "";

  const min = sec / 60;
  if (min === 0)
    return "";

  if (min < 0)
    return `<span class="label-delay"> ${min}' </span>`;
  else
    return `<span class="label-delay"> +${min}'</span> `;
}

/**
 * Takes a trip and returns a label to be rendered.
 *
 * @param trip Single trip
 */
function tripLabel(trip) {
  if (trip === undefined || trip === null)
    return "No info";

  return timeLabel(trip.time) + delayLabel(trip.delay) + ` — ${trip.product} ${trip.name} (${trip.direction})`;
}

/**
 * Creates a <li>-Element for a trip.
 *
 * @param trip Single trip
 */
function tripElement(trip) {
  const label = tripLabel(trip);
  const li = document.createElement('li');
  li.setAttribute('class', 'label-trip');
  li.innerHTML = label;

  return li;
}

/**
 * Takes a trip array from the API and renders relevant information.
 *
 * @param ul List for the trip elements
 * @param arr Contains next departures for relevant stations
 */
function render(ul, arr) {
  // Clear the list
  ul.innerHTML = "";

  // Add found trips
  for (obj of arr) {
    ul.appendChild(tripElement(parse(obj)));
  }
}

/**
 * Renders an error instead of a trip list.
 *
 * @param ul List for the trip elements
 * @param err Error
 */
function renderError(ul, err) {
  // Clear the list
  ul.innerHTML = "";

  const p = document.createElement('p');
  p.setAttribute('class', 'label-error');
  p.innerText = err;
  ul.appendChild(p);
}

/**
 * Retrieves data from the BVG API.
 */
function refresh() {
  for (params of interest) {
    const name = params.name;
    const id = params.id;
    const list = params.list;

    fetch(`${api}/stops/${id}/departures?duration=${duration}&linesOfStops=false&remarks=false&language=en`)
      .then(function (response) {
        return response.json();
      })
      .then(function (content) {
        console.log(name, content);
        render(list, content);
      })
      .catch(function (err) {
        console.error(name, err);
        renderError(list, err);
      });
  }
}

// Main loop
refresh();
const interval = setInterval(function () {
  refresh();
}, 10000);
