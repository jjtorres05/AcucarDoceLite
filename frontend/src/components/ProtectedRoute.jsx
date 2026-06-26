import {Navigate} from 'react-router-dom'

export default function ProtectedRoute({ authenticated, children }){
        if(!authenticated){
            return <Navigate to="/login" replace/>
        }
        return children
    }