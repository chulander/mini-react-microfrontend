// class App1 extends React.Component {
//     constructor(props) {
//         super(props);
//         this.handleClick = this.handleClick.bind(this);
//     }

//     handleClick(e) {
//         e.preventDefault();
//         if (this.props.hasOwnProperty('sandbox')) {
//             this.props.sandbox.notifyAll({type: "post-statuses", data: { opt1: "val1"}});
//         }
//     }

//     handleNotification(message) {
//         console.log(`received message ${message.type}`);
//     }

//     render()
//     {
//         return React.createElement('button', {
//             onClick: this.handleClick
//         },'Greetings 1, ' + this.props.name + '!');
//     }
// }
const App1 = function App1({ id, name, sandbox } = {}) {
  const savedHandler = React.useRef({});
  const [sibling, updateSibling] = React.useState();
  const [state, updateState] = React.useState({
    id,
    name,
    status: false
  });
  const listener = React.useCallback(
    function listener(message = {}) {
      const { detail: { _id, payload = {} } = {}, type } = message;
      console.log(`APP1: id ${_id} type ${type}`, payload);

      if (type === "broadcast") {
        // console.info(`${state.id}: receiving broadcast from ${_id}`, payload);
        // const {
        //   detail: { payload: _payload = {} }
        // } = payload;
        // if (_payload.id && _payload.id !== state.id) {
        //   updateSibling(_payload);
        // }
        // if (sandbox) {
        //   sandbox.dispatch("report", {
        //     ..._payload,
        //     _read: true
        //   });
        // }
      } else {
        const { action, state: _state, target } = payload;
        if (type === "override") {
          if (action === "post-status" && _state && target === state.id) {
            const newState = { ...state, ..._state };
            updateState(newState);
            if (sandbox) {
              sandbox.dispatch("report", {
                ...payload,
                type,
                _read: true,
                _readyBy: state.id
              });
              sandbox.dispatch("notify", newState);
            }
          } else if (action === "destroy") {
            if (sandbox) {
              sandbox.dispatch("report", {
                ...payload,
                type,
                _read: true,
                _readyBy: state.id
              });
              sandbox.destroy(payload);
            }
          }
        } else if (type === "ready" || type === "notify") {
          console.log("app1 ready type", payload);
          sandbox.dispatch("report", {
            ...payload,
            type,
            _read: true,
            _readyBy: state.id
          });
          updateSibling({ ...sibling, ...payload });
        }
      }
    },
    [sandbox, state, updateState, sibling, updateSibling]
  );
  React.useEffect(
    function mountHandler() {
      if (savedHandler) {
        savedHandler.current = listener;
      }
    },
    [savedHandler, listener]
  );

  React.useEffect(
    function componentDidMount() {
      const _events = ["notify", "override", "destroy", "ready"];
      if (sandbox) {
        sandbox.dispatch("ready", { status: true, name, id });
        const handler = savedHandler.current;
        sandbox.addListeners(_events, handler);
      }
      return function compoonentWillUnmount() {
        console.info(`${id} is unmounting`);
        if (sandbox) {
          sandbox.removeListeners(_events);
          sandbox.dispatch("destroy");
        }
      };
    },
    [sandbox, savedHandler]
  );

  //   React.useEffect(
  //     function mountListeners() {
  //       if (sandbox) {
  //         sandbox.listen(["broadcast", "override", "destroy"], listener);
  //       }
  //     },
  //     [sandbox, listener]
  //   );
  const handleClick = React.useCallback(
    function handleClick(e) {
      // e.preventDefault();
      updateState({ ...state, status: !state.status });
      if (sandbox) {
        sandbox.dispatch("notify", {
          ...state,
          status: !state.status
        });
      }
    },
    [sandbox, state, updateState]
  );

  const Button = React.useMemo(
    function Button() {
      return React.createElement(
        "button",
        {
          onClick: handleClick,
          style: {
            border: `2px solid blue`,
            borderRadius: "2px",
            backgroundColor: `${state.status === true ? "red" : "blue"}`,
            color: "white",
            width: "8rem",
            height: "2rem"
          }
        },
        `change to ${state.status === true ? "unavailable" : "available"}`
      );
    },

    [handleClick, state]
  );
  const Text = React.useMemo(
    function Text() {
      return React.createElement(
        "span",
        { style: { height: "10rem", width: "20rem", margin: "2rem" } },
        `${state.id} - Greetings: this is ${state.name} and my status is ${
          state.status === true ? "available" : "unavailable"
        }`
      );
    },
    [state]
  );
  const Element = React.useMemo(
    function Element() {
      return React.createElement(
        "section",
        {
          style: {
            width: "10rem",
            height: "5rem",
            display: "flex",
            flexDirection: "column"
          },
          id: state.id,
          name: state.name
        },
        Button,
        Text
      );
    },
    [handleClick, state, Button, Text]
  );
  return Element;
};
