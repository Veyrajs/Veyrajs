import { useState } from 'react'
import { ACStage, ACLayer, ACRect, ACCircle, ACText } from '@veyrajs/react'

// A live React island: the declarative @veyrajs/react API actually running.
export default function ReactScene() {
  const [x, setX] = useState(60)
  return (
    <div className="veyrajs-demo">
      <ACStage width={620} height={300} background="#0b1220" selectable>
        <ACLayer>
          <ACText x={18} y={14} text="@veyrajs/react — click the rect; drag the handles" fontSize={13} fill="#64748b" />
          <ACRect x={x} y={70} width={150} height={90} fill="#38bdf8" onClick={() => setX((v) => v + 20)} />
          <ACCircle x={380} y={150} radius={52} fill="#f472b6" />
        </ACLayer>
      </ACStage>
    </div>
  )
}
