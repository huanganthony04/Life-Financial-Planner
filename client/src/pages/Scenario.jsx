import { useState } from 'react'
import YAML from 'yaml'

const Scenario = () => {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState("")

  const handleFileChange = (e) => {
    const inputFile = e.target.files[0]
    const extension = inputFile.name.split(".").pop().toLowerCase()
    if (extension === "yaml") {
      setFile(inputFile)

    }
  }

  const parseFile = async (file) => {

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const fileContents = event.target.result
          const parsedData = YAML.parse(fileContents)
          resolve(parsedData)
        }
        catch(error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("File reading failed"))
      reader.readAsText(file)
    })

  }

  const handleUpload = async () => {
    if (file !== null) {
      const parsedData = await parseFile(file)
      setMessage(`Success! The parsed file contents:\n${JSON.stringify(parsedData, null, "\t")}`)
    }
    else {
      setMessage("Please submit a .yaml file.")
    }
  }
  return (
    <>
      <h1>Scenario Upload</h1>
      <input id="scenario_upload_input" type="file" accept=".yaml" onChange={handleFileChange}/>
      <button id="scenario_upload_button" onClick={handleUpload}>Upload</button>
      <pre id="scenario_upload_message">{message}</pre>
    </>
  )
}

export default Scenario