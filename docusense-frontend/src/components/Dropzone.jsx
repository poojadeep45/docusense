import { useRef, useState } from 'react'

export default function Dropzone({ onFileSelected }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelected(file)
  }

  return (
    <div
      className={`dropzone ${dragging ? 'drag' : ''}`}
      onClick={() => inputRef.current.click()}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false) }}
      onDrop={handleDrop}
    >
      <div className="icon">📄</div>
      <div className="dropzone-text">
        <strong>Drop a file here, or click to browse</strong>
        <span>PDF, DOCX, or TXT</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) onFileSelected(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
