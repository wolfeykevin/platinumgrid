import React from "react"
import { Div, Fix } from '../_styles/_global'
import Lottie from 'lottie-react'
import loader from '../_assets/lotties/loader.json'

const PageLoader = () => {

  const style = {
    height: 'auto',
    width: '18rem',
  }

  return (
    // <Fix offset="4rem" lower right>
    <Div flex column fills centerchildren>
      <Lottie style={style} animationData={loader} loop={true} />
    </Div>
    // </Fix>
  )
}

export default PageLoader