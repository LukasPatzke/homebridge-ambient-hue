import * as React from "react";

declare module 'react-detect-offline' {
  
  interface IPolling {
    enabled?:	boolean	
    url?:	string
    interval?:	number	
    timeout?:	number
  }

  interface IProps {
    polling?: IPolling | boolean
    onChange?:	Function
  }
  
  export class Offline extends React.Component<IProps> {}
  export class Online extends React.Component<IProps> {}
}