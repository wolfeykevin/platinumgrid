import React, { useState, useEffect } from "react"
import { Div, Fix } from '../_styles/_global'

const Loader = (props) => {

  const { message, callback, cancel } = props

  const [childKey, setChildKey] = useState(1);

  useEffect(() => {
    setChildKey(prev => prev + 1);
 }, [message]);

  return (
    <>
      <Div key={childKey} flex column fills centerchildren className="modal-cover">
        <div className="modal">
          <div className="modal-header">
            <div className="modal-header-title">
              { message.title }
            </div>
          </div>
          <div className="modal-body">
            <div className="modal-body-message">
              { message.body }
            </div>
          <div className="modal-body-buttons">
            <div className="modal-body-button-cancel" onClick={cancel}>
              Cancel
            </div>
            <div className="modal-body-button-confirm" onClick={callback}>
            { message.confirm }
            </div>
          </div>
          </div>
        </div>
        <div className="modal-tooltip">
          { message.tooltip }
        </div>
      </Div>
    </>
  )
}

export default Loader