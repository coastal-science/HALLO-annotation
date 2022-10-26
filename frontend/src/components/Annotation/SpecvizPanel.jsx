import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react"
import { Audio, Annotations, Spectrogram, Specviz, useSpecviz } from "../../specviz/src/specviz-react.jsx"

const savedData = [
  {
    "id": "56241226-5ac2-4cb4-8c22-64b7c13dbfa0",
    "timeFreq": {
      "startTime": 13.143858570330517,
      "endTime": 16.421288239815528,
      "startFreq": 2866.6666666666642,
      "endFreq": 9933.333333333332
    },
    "annotation": {
      "filename": "audiosample.wav",
      "label": "whale",
      "confidenceLevel": "high",
      "notes": "but maybe something else?"
    }
  },
  {
    "id": "c026b1ea-f07e-4366-a5f8-39935c3bcc02",
    "timeFreq": {
      "startTime": 21.712971560338204,
      "endTime": 26.458416602613376,
      "startFreq": 9733.333333333332,
      "endFreq": 12000
    },
    "annotation": {
      "filename": "audiosample.wav",
      "label": "not a whale",
      "confidenceLevel": "medium",
      "notes": "maybe some lobsters?"
    }
  }
]



const initAnno = { filename: "audiosample.wav", label: "", confidenceLevel: "", notes: "" }

function MyForm({ preload }){
  const { save } = useSpecviz();
	const [output, setOutput] = useState([]);
  return (
		<form>
      <Annotations preload={preload} initState={initAnno}>
        {({ id, timeFreq, annotation:data }, persistField) => (
          <div>
            <div>filename: <input value={data.filename} onChange={persistField("filename")} /></div>
            <div>label: <input value={data.label} onChange={persistField("label")} /></div>
            <div>confidenceLevel: <input value={data.confidenceLevel} onChange={persistField("confidenceLevel")} /></div>
            <div>notes: <input value={data.notes} onChange={persistField("notes")} /></div>
          </div>
        )}
      </Annotations>
      <button type="button" onClick={_ => setOutput(save())} children="Save" />
			<pre>{JSON.stringify(output, null, 2)}</pre>
    </form>
	);
}


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  tab: {
    padding: 0,
    margin: 1,
    minWidth: 5,
  },
  tabs: {
    padding: 0,
    margin: 0,
  },
}));

function AnnotationPanel() {
	return (
		<Specviz>
			<Spectrogram
        height={500}
				data="./data/spectrogram.png"
				duration={44.416000000000004}
				f_max={20000}
				f_min={0}
			/>
			<Audio src="./data/audiosample.wav">
        {({status, playpause, stop}) => (
          <div>
            <button onClick={playpause}>
              {status === "playing" ? "⏸" : "▶️" }
            </button>
            <button onClick={stop}>
              {"⏹"}
            </button>
          </div>
        )}
      </Audio>
			<MyForm preload={savedData} />
      <pre>{JSON.stringify({id, currentBatch, batches, segments, files }, null, 2)}</pre>
		</Specviz>
	);
}

export default AnnotationPanel;


