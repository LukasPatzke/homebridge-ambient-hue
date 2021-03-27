import React, { createContext, useEffect, useReducer } from "react";

interface IState {
  server?: string
  port?: number
  ssl?: boolean
}

interface IDispatchEvent extends IState {
  type: 'setServer'
}

const initialState: IState = {
  server: undefined,
  port: undefined,
  ssl: false,
}

const persistedState = JSON.parse(window.localStorage['persistedState'] || '{}');

let reducer = (state: IState, action: IDispatchEvent): IState => {
  switch(action.type) {
    case "setServer": {
      return { ...state, server: action.server, port: action.port, ssl: action.ssl }
    }
  }
  return state;
};

let AppContext = createContext<{
  state: IState|null;
  dispatch: React.Dispatch<any>;
}>({state: null, dispatch: ()=>null});

const AppContextProvider: React.FC = (props) => {
  

  const fullInitialState: IState = {
    ...initialState,
    ...persistedState
  }

  let [state, dispatch] = useReducer(reducer, fullInitialState);
  let value = { state, dispatch };

  useEffect(() => {
    // Persist any state we want to
    window.localStorage['persistedState'] = JSON.stringify(state);
  }, [state]);


  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
}

let AppContextConsumer = AppContext.Consumer;

export { AppContext, AppContextProvider, AppContextConsumer };
