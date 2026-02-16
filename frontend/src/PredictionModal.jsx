import { useState } from 'react'
import { Sparkles, Dices } from 'lucide-react'

export function PredictionModal({ isOpen, onClose }) {
    const initialData = {
        industry: 'Technology',
        lead_source: 'Organic Search',
        company_size_employees: 100,
        company_size_revenue_usd: 1000000,
        technologies_used: 'AWS, Python',
        crm_current_stage: 'New Lead',
        marketing_campaign_id: 'CAMP_2023_Q1',
        website_pages_visited_count: 5,
        website_downloads_count: 0,
        email_opens_count: 0,
        email_clicks_count: 0
    }

    const [formData, setFormData] = useState(initialData)
    const [prediction, setPrediction] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: (name.includes('count') || name.includes('size')) ? Number(value) : value
        }))
    }

    const handleRandomize = () => {
        const industries = ['SaaS', 'Healthcare', 'Manufacturing', 'Retail', 'Finance', 'Education', 'Technology', 'Marketing']
        const sources = ['Organic Search', 'Paid Ad', 'Referral', 'Webinar', 'Social Media', 'Email Campaign', 'Direct Mail']
        const stages = ['New Lead', 'Qualified', 'Discovery', 'Proposal', 'Negotiation']

        setFormData({
            industry: industries[Math.floor(Math.random() * industries.length)],
            lead_source: sources[Math.floor(Math.random() * sources.length)],
            company_size_employees: Math.floor(Math.random() * 5000) + 10,
            company_size_revenue_usd: Math.floor(Math.random() * 50000000) + 100000,
            technologies_used: ['AWS', 'React', 'Python', 'Salesforce', 'Azure'].sort(() => 0.5 - Math.random()).slice(0, 3).join(', '),
            crm_current_stage: stages[Math.floor(Math.random() * stages.length)],
            marketing_campaign_id: 'CAMP_2023_Q' + (Math.floor(Math.random() * 4) + 1),
            website_pages_visited_count: Math.floor(Math.random() * 50),
            website_downloads_count: Math.floor(Math.random() * 5),
            email_opens_count: Math.floor(Math.random() * 15),
            email_clicks_count: Math.floor(Math.random() * 5)
        })
        setPrediction(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setPrediction(null)

        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Prediction failed')
            }

            const result = await response.json()
            setPrediction(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content card">
                <div className="modal-header">
                    <h2>Predict Lead Conversion</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-actions" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={handleRandomize} className="text-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <Dices size={16} /> Randomize Data
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="prediction-form">

                    <h4 className="section-title">Company Profile</h4>
                    <div className="form-section">
                        <div className="form-group">
                            <label>Industry</label>
                            <select name="industry" value={formData.industry} onChange={handleChange}>
                                <option>Technology</option>
                                <option>SaaS</option>
                                <option>Finance</option>
                                <option>Healthcare</option>
                                <option>Manufacturing</option>
                                <option>Retail</option>
                                <option>Education</option>
                                <option>Marketing</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Emp. Count</label>
                            <input
                                type="number"
                                name="company_size_employees"
                                value={formData.company_size_employees}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Est. Revenue ($)</label>
                            <input
                                type="number"
                                name="company_size_revenue_usd"
                                value={formData.company_size_revenue_usd}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Technologies (comma sep.)</label>
                            <input
                                type="text"
                                name="technologies_used"
                                value={formData.technologies_used}
                                onChange={handleChange}
                                placeholder="e.g. AWS, React, Python"
                            />
                        </div>
                    </div>

                    <h4 className="section-title">Engagement & Source</h4>
                    <div className="form-section">
                        <div className="form-group">
                            <label>Lead Source</label>
                            <select name="lead_source" value={formData.lead_source} onChange={handleChange}>
                                <option>Organic Search</option>
                                <option>Paid Ad</option>
                                <option>Referral</option>
                                <option>Webinar</option>
                                <option>Social Media</option>
                                <option>Email Campaign</option>
                                <option>Direct Mail</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Current Stage</label>
                            <select name="crm_current_stage" value={formData.crm_current_stage} onChange={handleChange}>
                                <option>New Lead</option>
                                <option>Qualified</option>
                                <option>Discovery</option>
                                <option>Proposal</option>
                                <option>Negotiation</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Page Visits</label>
                            <input
                                type="number"
                                name="website_pages_visited_count"
                                value={formData.website_pages_visited_count}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Opens</label>
                            <input
                                type="number"
                                name="email_opens_count"
                                value={formData.email_opens_count}
                                onChange={handleChange}
                            />
                        </div>
                    </div>


                    <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '1.5rem' }}>
                        {loading ? <span className="loading-spinner"></span> : <><Sparkles size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> Predict Status</>}
                    </button>
                </form>

                {error && <div className="error-msg">{error}</div>}

                {prediction && (
                    <div className={`prediction-result ${prediction.predicted_status.toLowerCase()}`}>
                        <p style={{ fontSize: '1.1rem' }}>Prediction: <strong>{prediction.predicted_status}</strong></p>
                        <div className="confidence-wrapper" style={{ justifyContent: 'center', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Confidence:</span>
                            <div
                                className="confidence-bar"
                                style={{ width: '100px', backgroundColor: 'rgba(255,255,255,0.3)' }}
                            >
                                <div style={{ width: `${prediction.confidence_score * 100}%`, height: '100%', backgroundColor: 'currentColor', borderRadius: '3px' }}></div>
                            </div>
                            <span style={{ fontWeight: 'bold' }}>{(prediction.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
