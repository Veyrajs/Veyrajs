import { ACCircle, ACLayer, ACRect, ACStage, ACText } from '@veyrajs/react'
import { useState } from 'react'
import { palette } from '../_demo-theme'

// A live React island: the declarative @veyrajs/react API actually running.
export default function ReactScene() {
  const [x, setX] = useState(60)
  return (
    <div className="veyrajs-demo">
      <ACStage width={620} height={300} selectable>
        <ACLayer>
          <ACText
            x={18}
            y={14}
            text="@veyrajs/react — click the rect; drag the handles"
            fontSize={13}
            fill={palette.slate}
          />
          <ACRect
            x={x}
            y={70}
            width={150}
            height={90}
            fill={palette.blue}
            onClick={() => setX((v) => v + 20)}
          />
          <ACCircle x={380} y={150} radius={52} fill={palette.cyan} />
        </ACLayer>
      </ACStage>
    </div>
  )
}
