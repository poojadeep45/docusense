import React, { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
} from 'recharts';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { documents as docsApi, categories as categoriesApi, tags as tagsApi } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import TopHeader from '../components/TopHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { SkeletonStatRow, SkeletonChartCard } from '../components/Skeleton.jsx';

const STATUS_COLORS = {
  UPLOADED: '#9AA3B2',
  PROCESSING: '#B7791F',
  COMPLETED: '#1A7F5A',
  FAILED: '#C0392B',
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const [docs, setDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allDocs, allCats, allTags] = await Promise.all([
          docsApi.listAll(), categoriesApi.list(), tagsApi.list(),
        ]);
        if (cancelled) return;
        setDocs(allDocs);
        setCategories(allCats);
        setTags(allTags);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => ({
    total: docs.length,
    processing: docs.filter((d) => d.status === 'PROCESSING' || d.status === 'UPLOADED').length,
    completed: docs.filter((d) => d.status === 'COMPLETED').length,
    failed: docs.filter((d) => d.status === 'FAILED').length,
  }), [docs]);

  const statusData = useMemo(() => {
    const byStatus = {};
    docs.forEach((d) => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });
    return Object.entries(byStatus).map(([status, value]) => ({ name: status, value }));
  }, [docs]);

  const categoryData = useMemo(() => {
    const byCategory = {};
    docs.forEach((d) => {
      const name = d.category ? d.category.catName : 'Uncategorized';
      byCategory[name] = (byCategory[name] || 0) + 1;
    });
    return Object.entries(byCategory).map(([name, count]) => ({ name, count }));
  }, [docs]);

  const tagData = useMemo(() => {
    const byTag = {};
    docs.forEach((d) => (d.tags || []).forEach((t) => {
      byTag[t.tagName] = (byTag[t.tagName] || 0) + 1;
    }));
    return Object.entries(byTag)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [docs]);

  const uploadsOverTime = useMemo(() => {
    const byDay = {};
    docs.forEach((d) => {
      if (!d.uploadedAt) return;
      const day = d.uploadedAt.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([day, count]) => ({ day: day.slice(5), count }));
  }, [docs]);

  const gridColor = theme === 'dark' ? '#2A3B5C' : '#E2E6ED';
  const tickColor = theme === 'dark' ? '#9AA9C4' : '#5B6472';
  const cardBg = theme === 'dark' ? '#142B52' : '#FFFFFF';

  if (loading) {
    return (
      <>
        <TopHeader title="Dashboard" subtitle="An overview of everything in your workspace." />
        <SkeletonStatRow />
        <div className="chart-grid">
          <SkeletonChartCard />
          <SkeletonChartCard />
          <SkeletonChartCard />
          <SkeletonChartCard />
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader title="Dashboard" subtitle="An overview of everything in your workspace." />

      <div className="stat-row">
        <StatCard label="Total documents" value={counts.total} icon={FileText} tone="default" />
        <StatCard label="In progress" value={counts.processing} icon={Clock} tone="warning" />
        <StatCard label="Completed" value={counts.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Failed" value={counts.failed} icon={XCircle} tone="danger" />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-card-title">Documents by status</h3>
          {statusData.length === 0 ? (
            <p className="chart-empty">No documents yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#2F6FED'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: cardBg, border: 'none', borderRadius: 8, fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: tickColor }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title">Documents by category</h3>
          {categoryData.length === 0 ? (
            <p className="chart-empty">No documents yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickColor }} />
                <Tooltip contentStyle={{ background: cardBg, border: 'none', borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="count" fill="#2F6FED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title">Top tags</h3>
          {tagData.length === 0 ? (
            <p className="chart-empty">No tags used yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tagData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: tickColor }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: tickColor }} />
                <Tooltip contentStyle={{ background: cardBg, border: 'none', borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="count" fill="#1A7F5A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title">Uploads over time</h3>
          {uploadsOverTime.length === 0 ? (
            <p className="chart-empty">No upload history yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={uploadsOverTime}>
                <defs>
                  <linearGradient id="uploadsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F6FED" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2F6FED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: tickColor }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickColor }} />
                <Tooltip contentStyle={{ background: cardBg, border: 'none', borderRadius: 8, fontSize: 13 }} />
                <Area type="monotone" dataKey="count" stroke="#2F6FED" fill="url(#uploadsFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}