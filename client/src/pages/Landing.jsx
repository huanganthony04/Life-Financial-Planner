import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

const Landing = ({user}) => {

    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate("/dashboard")
        }
    })

  return (
    <div>Landing</div>
  )
}

export default Landing