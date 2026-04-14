import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageSection from '../../components/common/PageSection.jsx'
import InfoCard from '../../components/ui/InfoCard.jsx'
import {
  downloadProjectFile,
  deleteProjectFile,
  getProject,
  getProjectFiles,
  uploadProjectFile,
  viewProjectFile,
} from '../../services/projectService.js'
import {
  getApiErrorMessage,
  getCollection,
  getEntity,
  getText,
} from '../../utils/apiResponse.js'

function ProjectFilesPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingFileId, setDeletingFileId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    async function loadFiles() {
      try {
        setLoading(true)
        const [projectPayload, filesPayload] = await Promise.all([
          getProject(id).catch(() => null),
          getProjectFiles(id),
        ])

        if (!active) {
          return
        }

        setProject(getEntity(projectPayload))
        setFiles(getCollection(filesPayload))
        setError('')
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, 'Unable to load project files.'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadFiles()

    return () => {
      active = false
    }
  }, [id])

  async function refreshFiles() {
    const payload = await getProjectFiles(id)
    setFiles(getCollection(payload))
  }

  async function handleCopyWorkspacePath() {
    if (!project?.absolute_folder_path || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(project.absolute_folder_path)
    setSuccess('Workspace path copied.')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedFile) {
      setError('Choose a file before uploading.')
      return
    }

    try {
      setUploading(true)
      setError('')
      setSuccess('')
      await uploadProjectFile(id, selectedFile)
      await refreshFiles()
      setSuccess(`Uploaded ${selectedFile.name} successfully.`)
      setSelectedFile(null)
      event.target.reset()
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, 'Unable to upload file.'))
      setSuccess('')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(file) {
    try {
      setDeletingFileId(file.id)
      setError('')
      setSuccess('')
      await deleteProjectFile(id, file.id)
      await refreshFiles()
      setSuccess(`Deleted ${file.filename} successfully.`)
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Unable to delete file.'))
    } finally {
      setDeletingFileId(null)
    }
  }

  async function handleOpen(file, mode) {
    try {
      setError('')
      const blob =
        mode === 'download'
          ? await downloadProjectFile(id, file.id)
          : await viewProjectFile(id, file.id)
      const objectUrl = window.URL.createObjectURL(blob)

      if (mode === 'download') {
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = file.filename
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        window.open(objectUrl, '_blank', 'noopener,noreferrer')
      }

      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000)
    } catch (fileError) {
      setError(getApiErrorMessage(fileError, `Unable to ${mode} file.`))
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Project files</p>
        <h1>{project?.name ? `Files for ${project.name}` : `Files for project #${id}`}</h1>
        <p className="lead">
          Upload files, open them, download them, and remove them through the Laravel file endpoints.
        </p>
      </PageSection>

      <section className="info-grid">
        <InfoCard>
          <h2>Upload file</h2>
          {error ? <p className="feedback-message feedback-error">{error}</p> : null}
          {success ? (
            <p className="feedback-message feedback-success">{success}</p>
          ) : null}

          <form className="resource-form compact-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>File</span>
              <input
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <button type="submit" className="primary-button" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </InfoCard>

        <InfoCard>
          <h2>Quick actions</h2>
          <div className="session-list">
            <div>
              <p className="session-label">Project</p>
              <p className="session-value">{getText(project?.name, `Project #${id}`)}</p>
            </div>
            <div>
              <p className="session-label">Folder path</p>
              <p className="session-value">{getText(project?.folder_path, 'Not available')}</p>
            </div>
            <div>
              <p className="session-label">Workspace path</p>
              <p className="session-value">
                {getText(project?.absolute_folder_path, 'Not available')}
              </p>
            </div>
          </div>
          <div className="form-actions">
            <Link to={`/projects/${id}`} className="ghost-button action-link">
              Back to project
            </Link>
            {project?.vscode_url ? (
              <a href={project.vscode_url} className="ghost-button action-link">
                Open in VS Code
              </a>
            ) : null}
            {project?.absolute_folder_path ? (
              <button
                type="button"
                className="ghost-button action-link"
                onClick={handleCopyWorkspacePath}
              >
                Copy workspace path
              </button>
            ) : null}
          </div>
        </InfoCard>

        <InfoCard wide>
          <h2>Uploaded files</h2>
          {loading ? <p className="feedback-message">Loading files...</p> : null}
          {!loading && files.length === 0 ? (
            <p className="empty-state">No files found for this project.</p>
          ) : null}

          {!loading && files.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Path</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id ?? file.filepath}>
                      <td>{getText(file.filename)}</td>
                      <td>{getText(file.mime_type, 'Unknown')}</td>
                      <td>{getText(file.size, 'Unknown')}</td>
                      <td>{getText(file.filepath)}</td>
                      <td>
                        <div className="table-actions">
                          {file.id ? (
                            <button
                              type="button"
                              className="table-link button-link"
                              onClick={() => handleOpen(file, 'view')}
                            >
                              View
                            </button>
                          ) : null}
                          {file.id ? (
                            <button
                              type="button"
                              className="table-link button-link"
                              onClick={() => handleOpen(file, 'download')}
                            >
                              Download
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="table-link button-link"
                            onClick={() => handleDelete(file)}
                            disabled={deletingFileId === file.id}
                          >
                            {deletingFileId === file.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </InfoCard>
      </section>
    </>
  )
}

export default ProjectFilesPage
