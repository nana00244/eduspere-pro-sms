import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { format, parseISO } from 'date-fns';

interface AttendanceTrendChartProps {
    data: { date: string; rate: number; total: number }[];
    height?: number | string;
    title?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length && label) {
        return (
            <Paper sx={{ p: 1.5, boxShadow: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="body2" fontWeight="bold">
                    {format(parseISO(label), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="primary.main">
                    Rate: {payload[0].value}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Total marked: {payload[0].payload.total}
                </Typography>
            </Paper>
        );
    }
    return null;
};

const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ data, height = 300, title }) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%', height }}>
            {title && (
                <Typography variant="h6" gutterBottom fontWeight="medium" color="text.secondary">
                    {title}
                </Typography>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(parseISO(str), 'MMM dd')}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={(val) => `${val}%`}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="rate"
                        stroke={theme.palette.primary.main}
                        fillOpacity={1}
                        fill="url(#colorRate)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default AttendanceTrendChart;
