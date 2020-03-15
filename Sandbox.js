class Sandbox {
  constructor(props) {
    console.log(`Sandbox.js: ${props.id} constructor`);
    this.events = {};
    this.id = props.id;
    this.ref = React.createRef(null);
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
    // if (broadcast) {
    //   let handler;
    //   for (const fn in this.events) {
    //     console.log("what is fn", fn);
    //     if (fn === "broadcast") {
    //       console.log("fn is broadcast");
    //       handler = this.events[fn];
    //       break;
    //     }
    //   }
    //   // const handler = this.events["broadcast"];
    //   console.log("what is handler", handler);
    //   if (handler && typeof handler === "function") {
    //     console.log(`Sandbox.js: ${this.id} handling broadcast`, payload);
    //     handler({ type: "broadcast", _id, detail: { payload: message } });
    //   } else {
    //     console.error(
    //       `Sandbox.js: handle for ${this.id} does not have a broadcast handler`
    //     );
    //   }
    // } else {
    const handler = this.events[message.type];
    if (handler && typeof handler === "function") {
      console.log(`Sandbox.js: ${this.id} handling ${message.type}`, payload);
      handler(message);
    }
    // }
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
    this.ref.current.dispatchEvent(event);
  }
  dispatch(eventType, payload = {}) {
    const detail = {
      payload,
      _id: this.id
    };
    console.log(
      `Sandbox.js: dispatching eventType ${eventType} from ${this.id}`,
      detail
    );
    const event = new CustomEvent(eventType, {
      bubbles: true,
      detail
    });

    // this.ref.current.dispatchEvent(event);
    if (eventType === "ready") {
      console.log(
        `Sandbox.js: dispatching ${this.id} window dispatching ${eventType}`
      );
      window.dispatchEvent(event);
    } else {
      if (this.ref.current) {
        console.log(
          `Sandbox.js: dispatching ${this.id} custom event dispatching ${eventType}`
        );
        this.ref.current.dispatchEvent(event);
      } else {
        console.error(
          `Sandbox.js: ${this.id} cannot custom event dispatch ${eventType}`
        );
        // window.dispatchEvent(event);
      }
    }
  }
}
