class Sandbox {
  constructor(props) {
    console.log(`Sandbox.js: ${props.id} constructor`);
    this.events = {};
    this.id = props.id;
    this._parentRef = props._parentRef;
  }
  addListener(evt, handler) {
    if (typeof handler !== "function") {
      console.error(
        `Sandbox.js: ${this.id} addListener - handler for ${evt} is not a function`
      );
    } else {
      if (!this.events[evt]) {
        this.events[evt] = handler;
        console.log(
          `Sandbox.js: ${this.id} addListener - added handler for ${evt}`
        );
      } else {
        console.error(
          `Sandbox.js: ${this.id} addListener - handler for ${evt} already exists`
        );
      }
    }
  }
  addListeners(evts, handler) {
    if (Array.isArray(evts)) {
      evts.forEach(evt => {
        this.addListener(evt, handler);
      });
    } else {
      console.error(
        `Sandbox.js: listen method for ${this.id} - evts is not an array`
      );
    }
  }
  removeListener(evt) {
    if (this.events[evt]) {
      console.log(`Sandbox.js: ${this.id} removing ${evt}`);
      delete this.events[evt];
    } else {
      console.error(`Sandbox.js: ${this.id} event ${evt} does not exist`);
    }
  }
  removeListeners() {
    for (const evt in this.events) {
      this.removeListener(evt);
    }
  }

  handle(message = {}) {
    const { detail: { _id, payload = {} } = {}, type } = message;
    console.log(`Sandbox.js: handle for ${this.id} `, payload);
    const handler = this.events[message.type];
    if (handler && typeof handler === "function") {
      console.log(`Sandbox.js: ${this.id} handling ${message.type}`, payload);
      handler(message);
    }
  }
  destroy(message = {}) {
    const event = new CustomEvent("destroy", {
      bubbles: true,
      detail: {
        ...message,
        target: this.id,
        _id: this.id
      }
    });
    this._parentRef.current.dispatchEvent(event);
  }
  dispatch(eventType, payload = {}) {
    const detail = {
      payload,
      _id: this.id
    };
    const event = new CustomEvent(eventType, {
      bubbles: true,
      detail
    });

    if (this._parentRef.current) {
      console.log(
        `Sandbox.js: dispatching ${this.id} custom event dispatching ${eventType}`,
        event
      );
      this._parentRef.current.dispatchEvent(event);
    } else {
      console.error(
        `Sandbox.js: ${this.id} cannot custom event dispatch ${eventType}`
      );
    }
  }
}
