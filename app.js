function App(props) {
  const moduleData = React.useRef({});
  const broadcast = React.useCallback(
    function broadcast(id, message = {}) {
      const { detail: { _id, payload = {} } = {}, type } = message;
      const { target } = payload;
      console.log(`App.js - broadcast: ${type} for ${_id}`, payload);

      for (const moduleId in moduleData.current) {
        console.log(`_id ${_id} and moduleId ${moduleId}`);
        if (_id !== moduleId) {
          const module = moduleData.current[moduleId];

          if (module) {
            console.log(
              `App.js - broadcast: ${type} for ${_id} moduleId is ${moduleId}`
            );

            if (type === "destroy" && moduleId === target) {
              console.log(`App.js - destroying ${moduleId}`);
              module.instance.destroy(target);
              module.instance = null;
              module.sandbox = null;
              module.deps = null;
              module.isReady = null;
              moduleData.current[moduleId] = null;
            } else {
              console.log(`App.js - broadcasting message for ${moduleId}`);
              module.sandbox.handle(message);
            }
          } else {
            console.error(
              `App.js - broadcast: ${type} module missting - ${moduleId}`,
              payload
            );
          }
        }
      }
    },
    [moduleData]
  );

  const genericHandler = React.useCallback(
    function genericHandler(message = {}) {
      const { detail: { _id, payload = {}, target } = {}, type } = message;
      console.log(`App.js - genericHandler: ${type} for ${_id}`, payload);
      const module = moduleData.current[_id];
      if (module) {
        module.sandbox.handle(message);

        if (type === "destroy" && target === _id) {
          module.instance.destroy(target);
        }
      }
      broadcast(_id, message);
    },
    [moduleData, broadcast]
  );
  const readyHandler = React.useCallback(
    function readyHandler(message = {}) {
      const { detail: { _id, payload = {} } = {}, type } = message;
      console.log(`App.js - readyHandler: ${type} for ${_id}`, payload);
      const module = moduleData.current[_id];
      if (module) {
        module.sandbox.ref.current.addEventListener("destroy", genericHandler);
        module.sandbox.ref.current.addEventListener("ready", genericHandler);
        module.sandbox.ref.current.addEventListener("override", genericHandler);
        module.sandbox.ref.current.addEventListener("notify", genericHandler);
        module.sandbox.ref.current.addEventListener("report", genericHandler);
        // }
      } else {
        console.error(
          `App.js - readyHandler: ${type} MISSING - ${_id}`,
          payload
        );
      }
      broadcast(_id, message);
      // notifyAll(detail.id, message);
    },
    [moduleData, broadcast, genericHandler]
  );
  React.useEffect(function compoonentDidMount() {
    console.log("Main App mounted");
    window.addEventListener("ready", readyHandler);
    return function componentWillUnmount() {
      console.log("Main App unmounted");
      window.removeEventListener("ready", readyHandler);
    };
  }, []);

  const register = React.useCallback(
    function register(moduleId, creator) {
      console.log(`App.js - register: ${moduleId}`);
      if (!moduleData.current[moduleId]) {
        moduleData.current[moduleId] = {
          creator,
          instance: null,
          sandbox: null
        };
      } else {
        console.error(
          `App.js - register: ${moduleId} already exists`,
          moduleData.current[moduleId]
        );
      }
    },
    [moduleData]
  );

  const start = React.useCallback(
    function start(moduleId) {
      console.log(`App.js - start: ${moduleId}`);
      const module = moduleData.current[moduleId];
      if (module && module.instance === null) {
        const sandbox = new Sandbox({ id: moduleId });
        module.instance = module.creator(sandbox);
        module.instance.init(sandbox.ref);
        module.sandbox = sandbox;
        // module.deps = false;
        console.log(`module: ${moduleId} initialized`);
      } else {
        console.error(
          `App.js - start: ${moduleId}.instance  exists`,
          moduleData.current[moduleId]
        );
      }
    },
    [moduleData]
  );

  const stop = React.useCallback(
    function stop(moduleId) {
      console.log(`App.js - stop: ${moduleId}`);
      const module = moduleData.current[moduleId];
      if (module) {
        if (module.instance) {
          module.instance.destroy();
          module.instance = null;
          // module.missingDeps = null;
        }

        console.log(`module: ${moduleId} destroyed`);
        module.sandbox = null;
      } else {
        console.error(`App.js - stop: ${moduleId}  does not exists`);
      }
    },
    [moduleData]
  );

  const startAll = React.useCallback(
    function startAll() {
      for (const moduleId in moduleData.current) {
        console.log(`App.js - startAll: starting ${moduleId}`);
        start(moduleId);
      }
    },
    [moduleData, start]
  );

  const stopAll = React.useCallback(
    function stopAll() {
      for (const moduleId in moduleData.current) {
        console.log(`App.js - stopAll: stopping ${moduleId}`);
        stop(moduleId);
      }
    },
    [moduleData, stop]
  );

  const simulateLoadApp1 = React.useCallback(
    function simulateLoadApp1() {
      // register app 1
      const id = "app1";
      register(id, function creator(sandbox) {
        return {
          init(ref) {
            ReactDOM.render(
              React.createElement(App1, {
                name: "Corey",
                id,
                ref,
                sandbox
              }),
              document.getElementById("layout_slot_1")
            );
          },
          destroy(id) {
            const elem = document.getElementById(id);
            console.log("what is elem", elem);
            elem.remove();
          }
        };
      });
      start(id);
    },
    [register, start]
  );

  const simulateLoadApp2 = React.useCallback(
    function simulateLoadApp2() {
      // register app 2
      const id = "app2";
      register(id, function creator(sandbox) {
        return {
          init(_ref) {
            ReactDOM.render(
              React.createElement(App2, {
                name: "Bryan",
                id,
                ref: _ref,
                sandbox
              }),
              document.getElementById("layout_slot_2")
            );
          },

          destroy(id) {
            const elem = document.getElementById(id);
            console.log("what is elem", elem);
            elem.remove();
          }
        };
      });
      start(id);
    },
    [register, start]
  );
  const button1 = React.useMemo(function button1() {
    return React.createElement(
      "button",
      {
        onClick: simulateLoadApp1,
        name: "app1"
      },
      "Load App 1"
    );
  }, []);
  const button2 = React.useMemo(function button2() {
    return React.createElement(
      "button",
      {
        onClick: simulateLoadApp2,
        name: "app2"
      },
      "Load App 2"
    );
  }, []);

  const slot1 = React.useMemo(function slot1() {
    return React.createElement("div", {
      id: "layout_slot_1",
      style: {
        border: "2px dotted red",
        display: "flex",
        minHeight: "10rem",
        width: "15rem"
      }
    });
  }, []);
  const slot2 = React.useMemo(function slot2() {
    return React.createElement("div", {
      id: "layout_slot_2",
      style: {
        border: "2px dotted yellow",
        display: "flex",
        minHeight: "10rem",
        width: "15rem"
      }
    });
  }, []);
  const Element = React.useMemo(
    function Element() {
      return React.createElement(
        "div",
        {
          style: { height: "4rem", width: "10rem" }
        },
        button1,
        button2,
        slot1,
        slot2
      );
    },
    [button1, button2, slot1, slot2]
  );
  return Element;
}
