// class App2 extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             name: this.props.name,
//             status: ''
//         }
//         this.handleStartProcess = this.handleStartProcess.bind(this);
//     }

//     handleStartProcess(event) {
//         console.log(event.detail.status);
//         this.setState({ status: event.detail.status});
//     }

//     componentDidMount() {
//         if (this.props.hasOwnProperty('sandbox')) {
//             this.props.sandbox.listen(["timeline-filter-change", "post-status"], message => {
//                 console.log(message);
//             })
//         }
//     }

//     componentWillUnmount() {
//         if (this.props.hasOwnProperty('sandbox')) {
//             this.props.sandbox.destroy();
//         }
//     }

//     render() {
//         return React.createElement('div', null, 'Status: ' + this.state.status);
//     }
// }

const App2 = React.forwardRef(function App2({ id, name, sandbox } = {}, ref) {
  const savedHandler = React.useRef({});
  const [sibling, updateSibling] = React.useState();
  const [state, updateState] = React.useState({ id, name });

  const listener = React.useCallback(
    function listener(message = {}) {
      const { detail: { _id, payload = {} } = {}, type } = message;
      console.info(`${state.id}: receiving broadcast from ${_id}`, payload);

      if (type === "broadcast") {
        console.info(`app2: ${_id} receiving broadcast`, payload);
        const {
          detail: { payload: _payload = {} }
        } = payload;

        if (_payload.id && _payload.id !== state.id) {
          updateSibling(_payload);
        }
        if (sandbox) {
          sandbox.dispatch("report", {
            ..._payload,
            _read: true
          });
        }
      } else {
        const { action, target, status } = payload;
        if (type === "notify" || type === "ready") {
          // if (detail.id !== stateId) {
          console.log("app2 notify payload", payload);
          sandbox.dispatch("report", {
            ...payload,
            type,
            _read: true,
            _readyBy: state.id
          });
          updateSibling({ ...sibling, ...payload });
        } else if (type === "dependency_ready") {
          console.log("dependency change what is message", message);
          // if (detail.id !== stateId) {
          sandbox.dispatch("report", {
            ...payload,
            type,
            _read: true,
            _readyBy: state.id
          });
          updateSibling({ ...detail });
          // }
        } else if (action === "destroy") {
          if (sandbox) {
            sandbox.dispatch("report", {
              ...payload,
              type,
              _read: true,
              _readyBy: state.id
            });
            sandbox.dispatch(action);
          }
        }
      }
    },
    [state, updateState, sandbox, updateSibling, sibling]
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
      const _events = ["notify", "destroy", "ready"];
      if (sandbox) {
        sandbox.dispatch("ready", { status: true, name, id });
        const handler = savedHandler.current;
        sandbox.addListeners(_events, handler);
      }
      return function componentWillUnmount() {
        console.info(`${id} is unmounting`);
        if (sandbox) {
          sandbox.removeListeners(_events);
          sandbox.dispatch("destroy");
        }
      };
    },
    [sandbox, savedHandler]
  );

  // React.useEffect(() => {
  //   if (sibling !== sandbox.isReady) {
  //     console.log("different in ready for app2");
  //     updateSibling(sandbox.isReady);
  //   }
  // });

  const handleClick = React.useCallback(
    function handleClick(e) {
      e.preventDefault();
      if (sandbox) {
        sandbox.dispatch("override", {
          action: "post-status",
          target: "app1",
          state: {
            ...sibling,
            status: !sibling.status
          }
        });
      }
    },
    [sandbox, sibling]
  );
  const handleDestroy = React.useCallback(
    function handleDestroy(e) {
      e.preventDefault();
      if (sandbox) {
        sandbox.dispatch("override", {
          action: "destroy",
          target: "app1"
        });
      }
    },
    [sandbox]
  );

  const Family = React.useMemo(
    function Family() {
      return React.createElement(
        "span",
        { style: { height: "10rem", width: "20rem", margin: "2rem" } },
        `${state.id} - Greetings: this is ${state.name}`
      );
    },
    [state]
  );
  const siblingStatus = !sibling || !sibling.status;
  const DestroyButton = React.useMemo(
    function DestroyButton() {
      return React.createElement(
        "button",
        {
          onClick: handleDestroy,
          id: "destroy-button",
          style: {
            border: "2px solid whilte",
            borderRadius: "2px",
            backgroundColor: `${!siblingStatus ? "blue" : "red"}`,
            color: "white",
            marginTop: "4rem",
            width: "8rem",
            fontWeight: "bold",
            height: "2rem"
          }
        },
        `Destroy Sibling`
      );
    },
    [handleDestroy, siblingStatus]
  );
  const Button = React.useMemo(
    function Button() {
      return React.createElement(
        "button",
        {
          onClick: handleClick,
          id: "override-status",
          style: {
            border: "2px solid blue",
            borderRadius: "2px",
            backgroundColor: `${!siblingStatus ? "blue" : "red"}`,
            color: "white",
            marginTop: "4rem",
            width: "8rem",
            height: "2rem"
          }
        },
        `change to sibling ${!siblingStatus ? "available" : "unavailable"}`
      );
    },
    [siblingStatus, handleClick]
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
          name: state.name,
          ref
        },
        !sibling ? null : Button,
        Family,
        !sibling ? null : DestroyButton
      );
    },
    [state, ref, Button, DestroyButton, sandbox, Family]
  );
  return Element;
});
