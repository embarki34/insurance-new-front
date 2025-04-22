import React from 'react'

function Execution({execution}: {execution: any}) {
  return (
    <div>
        <h1>Execution</h1>
        <pre>{JSON.stringify(execution, null, 2)}</pre>
    </div>
  )
}

export default Execution