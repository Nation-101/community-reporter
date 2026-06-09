import { useState, useEffect, useCallback } from 'react'
import { Droplets, TrafficCone, Trash2, LightbulbOff, AlertTriangle, Construction, TreePine, Ellipsis, ArrowLeft } from 'lucide-react'
import { supabase, getDeviceId, setDeviceContext } from './lib/supabase'

// ─── Constants ───

const SCREENS = {
  DASHBOARD: 'dashboard',
  CAMERA: 'camera',
  REVIEW: 'review',
  CONFIRMATION: 'confirmation',
  MY_REPORTS: 'my_reports',
}

const categories = [
  { id: 'water_leak', label: 'Water Leak / Burst Pipe', gradient: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', Icon: Droplets },
  { id: 'pothole', label: 'Pothole', gradient: 'linear-gradient(135deg, #EF6C00 0%, #BF360C 100%)', Icon: TrafficCone },
  { id: 'illegal_dumping', label: 'Illegal Dumping', gradient: 'linear-gradient(135deg, #6D4C41 0%, #3E2723 100%)', Icon: Trash2 },
  { id: 'streetlight_fault', label: 'Streetlight Fault', gradient: 'linear-gradient(135deg, #4A148C 0%, #311B92 100%)', Icon: LightbulbOff },
  { id: 'traffic_light_fault', label: 'Traffic Light Fault', gradient: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)', Icon: AlertTriangle },
  { id: 'damaged_road', label: 'Damaged Road / Pavement', gradient: 'linear-gradient(135deg, #546E7A 0%, #263238 100%)', Icon: Construction },
  { id: 'overgrown_vegetation', label: 'Overgrown Vegetation', gradient: 'linear-gradient(135deg, #558B2F 0%, #1B5E20 100%)', Icon: TreePine },
  { id: 'other', label: 'Other', gradient: 'linear-gradient(135deg, #00695C 0%, #00332A 100%)', Icon: Ellipsis },
]

const STATUS_COLORS = {
  reported: '#F9A825',
  acknowledged: '#1565C0',
  dispatched: '#6A1B9A',
  resolved: '#2E7D32',
}

const STATUS_LABELS = ['Reported', 'Acknowledged', 'Dispatched', 'Resolved']
const STATUS_KEYS = ['reported', 'acknowledged', 'dispatched', 'resolved']

// ─── Components ───

function CategoryCard({ label, gradient, Icon, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group relative w-full h-full min-h-[180px] rounded-2xl overflow-hidden 
                   shadow-lg hover:shadow-xl active:shadow-md
                   transform hover:scale-[1.02] active:scale-[0.98]
                   transition-all duration-200 ease-out
                   focus:outline-none focus:ring-4 focus:ring-white/50 cursor-pointer"
        style={{ background: gradient }}
        aria-label={`Report ${label}`}
      >
        <div className="flex flex-col items-center justify-center gap-4 p-6 h-full">
          <Icon size={48} strokeWidth={1.5} className="text-white/90 group-hover:text-white group-hover:scale-110 transition-all duration-200" />
          <span className="text-white font-semibold text-sm leading-tight text-center tracking-[-0.2px]">{label}</span>
        </div>
      </button>
    </li>
  )
}

function Dashboard({ onSelectCategory, onViewReports }) {
  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 md:p-10"
      style={{ background: 'linear-gradient(135deg, #F5F7FA 0%, #E8ECF1 100%)' }}
    >
      <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-[-0.5px]">Community Reporter</h1>
          <p className="text-[rgba(0,0,0,0.6)] text-sm mt-1">Report local problems. Stay anonymous. Get results.</p>
        </div>
        <button
          onClick={onViewReports}
          className="px-4 py-2 rounded-xl bg-white shadow-md hover:shadow-lg text-sm font-medium text-[#1A1A1A] transition-all duration-200"
        >
          My Reports
        </button>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
        {categories.map((category) => (
          <CategoryCard key={category.id} {...category} onClick={() => onSelectCategory(category)} />
        ))}
      </ul>

      <p className="mt-8 text-xs text-[rgba(0,0,0,0.4)]">
        You are Anonymous Reporter · No personal data is stored
      </p>
    </main>
  )
}

function CameraScreen({ category, onBack, onPhotoTaken }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Get geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onPhotoTaken({
          file,
          previewUrl: URL.createObjectURL(file),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      // Fallback if geolocation denied — use a default (Tshwane center)
      () => {
        onPhotoTaken({
          file,
          previewUrl: URL.createObjectURL(file),
          lat: -25.7479,
          lng: 28.2293,
        })
      }
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 p-4 bg-black/80">
        <button onClick={onBack} className="text-white p-2">
          <ArrowLeft size={24} />
        </button>
        <div className="h-1 flex-1 rounded-full" style={{ background: category.gradient }} />
      </div>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="text-8xl mb-6">📸</div>
        <p className="text-white text-lg font-medium mb-2">Take a photo of the problem</p>
        <p className="text-white/50 text-sm mb-8">Category: {category.label}</p>

        <label className="px-8 py-4 bg-white text-black rounded-2xl font-semibold text-lg shadow-xl cursor-pointer hover:bg-gray-100 transition-all active:scale-95">
          📷 Open Camera
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <p className="text-white/30 text-xs mt-4">Or use the simulator button below</p>
        <button
          onClick={() => onPhotoTaken({
            file: null,
            previewUrl: null,
            lat: -25.7479 + (Math.random() - 0.5) * 0.02,
            lng: 28.2293 + (Math.random() - 0.5) * 0.02,
          })}
          className="mt-3 px-6 py-2 text-white/50 text-sm underline hover:text-white/80"
        >
          Simulate Photo (Demo)
        </button>
      </div>
    </div>
  )
}

function ReviewScreen({ category, photoData, onSubmit, onBack, isSubmitting }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={onBack} className="text-[#1A1A1A] p-2" disabled={isSubmitting}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Review & Submit</h2>
      </div>

      <div className="flex-1 flex flex-col items-center p-6">
        {/* Photo preview */}
        {photoData.previewUrl ? (
          <img src={photoData.previewUrl} alt="Preview" className="w-full max-w-md rounded-2xl shadow-lg mb-6" />
        ) : (
          <div className="w-full max-w-md h-64 bg-gray-200 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-gray-400">📷 Demo Mode — No photo</span>
          </div>
        )}

        {/* Location */}
        <div className="w-full max-w-md bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">📍 Location</p>
          <p className="text-[#1A1A1A] font-medium">{photoData.lat.toFixed(6)}, {photoData.lng.toFixed(6)}</p>
        </div>

        {/* Category */}
        <div className="w-full max-w-md bg-gray-50 rounded-xl p-4 mb-8">
          <p className="text-sm text-gray-500 mb-1">Category</p>
          <p className="text-[#1A1A1A] font-medium">{category.label}</p>
        </div>

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full max-w-md py-4 rounded-2xl font-semibold text-lg text-white shadow-xl transition-all active:scale-95 disabled:opacity-50"
          style={{ background: category.gradient }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  )
}

function ConfirmationScreen({ reportId, category, status, onReportAnother, onViewReports }) {
  const currentStatusIndex = STATUS_KEYS.indexOf(status)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Report Submitted</h2>
      <p className="text-lg text-[#1565C0] font-semibold mb-1">#{reportId?.slice(0, 8)}</p>
      <p className="text-[rgba(0,0,0,0.6)] mb-8">{category.label}</p>

      {/* Status Tracker */}
      <div className="w-full max-w-sm mb-8">
        {STATUS_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-3 mb-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white transition-colors duration-300"
              style={{ background: i <= currentStatusIndex ? STATUS_COLORS[STATUS_KEYS[i]] : '#E5E7EB' }}
            >
              {i <= currentStatusIndex ? '●' : '○'}
            </div>
            <span className={i <= currentStatusIndex ? 'text-[#1A1A1A] font-medium' : 'text-gray-400'}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onReportAnother}
          className="px-6 py-3 text-white rounded-xl font-medium shadow-lg"
          style={{ background: category.gradient }}
        >
          Report Another
        </button>
        <button
          onClick={onViewReports}
          className="px-6 py-3 bg-white border border-gray-200 text-[#1A1A1A] rounded-xl font-medium"
        >
          My Reports
        </button>
      </div>
    </div>
  )
}

function MyReportsScreen({ onBack }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await setDeviceContext()
      const deviceId = getDeviceId()

      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setReports(data || [])
    } catch (err) {
      console.error('Failed to fetch reports:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const getCategoryById = (id) => categories.find((c) => c.id === id)

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="text-[#1A1A1A] p-2">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">My Reports</h2>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading your reports...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-500">⚠️ Could not load reports</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={fetchReports} className="px-4 py-2 bg-[#1565C0] text-white rounded-xl">Retry</button>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg font-medium text-[#1A1A1A] mb-2">No reports yet</p>
          <p className="text-sm text-gray-500 mb-6">Reports you submit will appear here</p>
          <button onClick={onBack} className="px-6 py-3 bg-[#1565C0] text-white rounded-xl font-medium">Submit a Report</button>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="flex flex-col gap-3">
          {reports.map((report) => {
            const cat = getCategoryById(report.category)
            const Icon = cat?.Icon || Ellipsis
            return (
              <div key={report.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cat?.gradient || '#999' }}
                >
                  <Icon size={24} strokeWidth={1.5} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A1A1A] truncate">{cat?.label || report.category}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(report.created_at).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium text-white flex-shrink-0"
                  style={{ background: STATUS_COLORS[report.status] || '#999' }}
                >
                  {report.status}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Device ID footer */}
      <p className="mt-6 text-xs text-gray-400 text-center">
        Anonymous Reporter · {getDeviceId().slice(0, 8)}
      </p>
    </div>
  )
}

// ─── Main App ───

export default function App() {
  const [screen, setScreen] = useState(SCREENS.DASHBOARD)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [photoData, setPhotoData] = useState(null)
  const [submittedReport, setSubmittedReport] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectCategory = (category) => {
    setSelectedCategory(category)
    setScreen(SCREENS.CAMERA)
  }

  const handlePhotoTaken = (data) => {
    setPhotoData(data)
    setScreen(SCREENS.REVIEW)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      let photoUrl = null

      // Upload photo if a real file was captured
      if (photoData.file) {
        const fileName = `${Date.now()}-${photoData.file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-photos')
          .upload(fileName, photoData.file)

        if (uploadError) throw uploadError

        // Get signed URL (valid 30 days)
        const { data: urlData } = await supabase.storage
          .from('report-photos')
          .createSignedUrl(uploadData.path, 60 * 60 * 24 * 30)

        photoUrl = urlData?.signedUrl
      }

      // Set device context for RLS
      const deviceId = await setDeviceContext()

      // Insert report into Supabase
      const { data: reportData, error: insertError } = await supabase
        .from('reports')
        .insert({
          device_id: deviceId,
          category: selectedCategory.id,
          photo_url: photoUrl,
          lat: photoData.lat,
          lng: photoData.lng,
          location: `POINT(${photoData.lng} ${photoData.lat})`,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setSubmittedReport(reportData)
      setScreen(SCREENS.CONFIRMATION)
    } catch (err) {
      console.error('Submission failed:', err)
      alert(`Failed to submit report: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToDashboard = () => {
    setSelectedCategory(null)
    setPhotoData(null)
    setSubmittedReport(null)
    setScreen(SCREENS.DASHBOARD)
  }

  switch (screen) {
    case SCREENS.CAMERA:
      return (
        <CameraScreen
          category={selectedCategory}
          onBack={() => setScreen(SCREENS.DASHBOARD)}
          onPhotoTaken={handlePhotoTaken}
        />
      )
    case SCREENS.REVIEW:
      return (
        <ReviewScreen
          category={selectedCategory}
          photoData={photoData}
          onSubmit={handleSubmit}
          onBack={() => setScreen(SCREENS.CAMERA)}
          isSubmitting={isSubmitting}
        />
      )
    case SCREENS.CONFIRMATION:
      return (
        <ConfirmationScreen
          reportId={submittedReport?.id}
          category={submittedReport ? { label: selectedCategory?.label, gradient: selectedCategory?.gradient } : selectedCategory}
          status={submittedReport?.status || 'reported'}
          onReportAnother={handleBackToDashboard}
          onViewReports={() => setScreen(SCREENS.MY_REPORTS)}
        />
      )
    case SCREENS.MY_REPORTS:
      return <MyReportsScreen onBack={handleBackToDashboard} />
    case SCREENS.DASHBOARD:
    default:
      return (
        <Dashboard
          onSelectCategory={handleSelectCategory}
          onViewReports={() => setScreen(SCREENS.MY_REPORTS)}
        />
      )
  }
}