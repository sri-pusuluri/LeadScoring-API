import { useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from 'recharts'
import { ThemeProvider, useTheme } from './ThemeContext'
import { Sun, Moon, Sparkles, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { PredictionModal } from './PredictionModal'
import './App.css'

function Dashboard() {
    const [leads, setLeads] = useState([])
    const [stats, setStats] = useState(null)
    const [modelStats, setModelStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()

    // Table State
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch more data to make pagination useful
            const leadsRes = await fetch('http://localhost:8000/leads?limit=200')
            const leadsData = await leadsRes.json()
            setLeads(leadsData)

            const statsRes = await fetch('http://localhost:8000/stats')
            const statsData = await statsRes.json()
            setStats(statsData)

            const modelStatsRes = await fetch('http://localhost:8000/model-stats')
            const modelStatsData = await modelStatsRes.json()
            setModelStats(modelStatsData)

        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // --- Table Logic ---
    const handleSort = (key) => {
        let direction = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    const sortedLeads = [...leads].sort((a, b) => {
        if (!sortConfig.key) return 0

        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle numeric/string comparisons
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
    })

    const filteredLeads = sortedLeads.filter(lead => {
        const term = searchTerm.toLowerCase()
        return (
            lead.company_id.toLowerCase().includes(term) ||
            lead.industry.toLowerCase().includes(term) ||
            lead.lead_source.toLowerCase().includes(term) ||
            lead.predicted_status.toLowerCase().includes(term)
        )
    })

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)

    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    // Reset page on search/filter change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, itemsPerPage])

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Prepare chart data
    const industryData = stats ? Object.keys(stats.industry_distribution).map(key => ({
        name: key,
        value: stats.industry_distribution[key]
    })) : [];

    const sourceData = stats ? Object.keys(stats.conversion_by_source).map(key => ({
        name: key,
        value: stats.conversion_by_source[key]
    })) : [];

    // Helper for Sort Icons
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return <div className="sort-icon-placeholder" />
        return sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    }

    return (
        <div className="container" data-theme={theme}>
            <header>
                <h1>Lead Scoring Dashboard <span className="beta-badge">ML Enabled</span></h1>
                <div className="header-actions">
                    <button className="theme-toggle" onClick={() => setIsModalOpen(true)}>
                        <Sparkles size={18} style={{ marginRight: '8px' }} /> Predict Lead
                    </button>

                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button className="refresh-btn" onClick={fetchData} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </header>

            <PredictionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {stats && (
                <div className="stats-grid">
                    <div className="card stat-card">
                        <h3>Total Leads</h3>
                        <p className="stat-value">{stats.total_leads}</p>
                    </div>
                    <div className="card stat-card">
                        <h3>Conversion Rate</h3>
                        <p className="stat-value">{stats.conversion_rate}%</p>
                    </div>
                    <div className="card stat-card">
                        <h3>Avg Deal Value</h3>
                        <p className="stat-value">${stats.avg_deal_value.toLocaleString()}</p>
                    </div>
                    {modelStats && (
                        <div className="card stat-card ml-stat">
                            <h3>Model Accuracy</h3>
                            <p className="stat-value">{(modelStats.accuracy * 100).toFixed(1)}%</p>
                            <span className="stat-subtitle">Logistic Regression</span>
                        </div>
                    )}
                </div>
            )}

            <div className="charts-grid">
                <div className="card chart-card">
                    <h3>Leads by Industry</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={industryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="card chart-card">
                    <h3>Conversions by Source</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={sourceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {sourceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="table-card card">
                <div className="table-header">
                    <h3>Recent Leads & Predictions</h3>
                    <div className="table-controls">
                        <div className="search-wrapper">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('company_id')} className="sortable">
                                    Company {getSortIcon('company_id')}
                                </th>
                                <th onClick={() => handleSort('industry')} className="sortable">
                                    Industry {getSortIcon('industry')}
                                </th>
                                <th onClick={() => handleSort('lead_source')} className="sortable">
                                    Source {getSortIcon('lead_source')}
                                </th>
                                <th onClick={() => handleSort('deal_value_usd')} className="sortable">
                                    Deal Value {getSortIcon('deal_value_usd')}
                                </th>
                                <th onClick={() => handleSort('predicted_status')} className="sortable">
                                    Predicted Status {getSortIcon('predicted_status')}
                                </th>
                                <th onClick={() => handleSort('confidence_score')} className="sortable">
                                    Confidence {getSortIcon('confidence_score')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLeads.length > 0 ? (
                                currentLeads.map((lead, index) => (
                                    <tr key={index}>
                                        <td>{lead.company_id}</td>
                                        <td>{lead.industry}</td>
                                        <td>{lead.lead_source}</td>
                                        <td>${lead.deal_value_usd.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge ${lead.predicted_status.toLowerCase()}`}>
                                                {lead.predicted_status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="confidence-wrapper">
                                                <div
                                                    className="confidence-bar"
                                                    style={{ width: `${lead.confidence_score * 100}%` }}
                                                ></div>
                                                <span>{(lead.confidence_score * 100).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">No leads found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-controls">
                    <div className="rows-per-page">
                        <span>Rows per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="page-nav">
                        <span className="page-info">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            className="page-btn"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function App() {
    return (
        <ThemeProvider>
            <Dashboard />
        </ThemeProvider>
    )
}

export default App
