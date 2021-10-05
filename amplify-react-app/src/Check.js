import React, { useState } from 'react'

 const Check = () => {
    const [Check, setCheck] = useState(false)
    const handleButton = () => {
        setCheck(!Check)
    }
    return (
        <div>
            <div>
                {Check ? "Hello All" : "Bye"}
            </div>
            <div>
                <button onClick={handleButton}>Click</button>
            </div>
        </div>
    )
}
export default Check