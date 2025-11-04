'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Medal, Award, Loader2, TrendingUp, Star } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import progressAPI, { LeaderboardEntry } from '@/lib/api/progress.api'
import { ROLE_COLORS } from '@/lib/theme'

export default function LeaderboardPage() {
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentRank, setCurrentRank] = useState<LeaderboardEntry | null>(null)
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('all')
  const [gameName, setGameName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/')
      return
    }

    loadLeaderboardData()
  }, [isAuthenticated, isInitialized, user, router, period])

  const loadLeaderboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get student progress to find enrolled game
      const progressData = await progressAPI.getStudentProgress(user.id)
      const enrollments = progressData.enrollments || []
      const activeEnrollment = enrollments.find((e: any) => e.is_active)
      const enrolledGameId = activeEnrollment?.game_id

      if (activeEnrollment) {
        setGameName(activeEnrollment.game_name)
      }

      // Load leaderboard
      const leaderboardData = await progressAPI.getLeaderboard(
        user.class_code || 'CLASS2025',
        period,
        user.id,
        enrolledGameId
      )

      setLeaderboard(leaderboardData.leaderboard || [])
      setCurrentRank(leaderboardData.current_student)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return 'This Week'
      case 'month':
        return 'This Month'
      default:
        return 'All Time'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />
      default:
        return null
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500'
      case 2:
        return 'bg-gray-400'
      case 3:
        return 'bg-orange-600'
      default:
        return 'bg-gray-600'
    }
  }

  if (!isInitialized || loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8" style={{ color: ROLE_COLORS.student.primary }} />
          <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            Leaderboard
          </h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: ROLE_COLORS.student.primary }} />
          <span className="ml-3 text-lg text-gray-600">Loading leaderboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-8 h-8" style={{ color: ROLE_COLORS.student.primary }} />
        <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
          Leaderboard
        </h1>
      </div>
      {gameName && (
        <p className="text-gray-600 mb-8">{gameName}</p>
      )}

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Time Period:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'week'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={period === 'week' ? { backgroundColor: ROLE_COLORS.student.primary } : {}}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'month'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={period === 'month' ? { backgroundColor: ROLE_COLORS.student.primary } : {}}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === 'all'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={period === 'all' ? { backgroundColor: ROLE_COLORS.student.primary } : {}}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Your Rank Card */}
      {currentRank && (
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div
            className="px-6 py-3 text-white font-semibold"
            style={{ backgroundColor: ROLE_COLORS.student.primary }}
          >
            Your Rank
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(currentRank.rank)}`}>
                  <span className="text-white font-bold text-lg">#{currentRank.rank}</span>
                </div>
                {getRankIcon(currentRank.rank)}
                <div>
                  <p className="font-semibold text-lg text-gray-900">{currentRank.name}</p>
                  <p className="text-sm text-gray-500">{currentRank.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Star className="w-5 h-5 text-orange-500" />
                  <p className="font-bold text-2xl text-gray-900">{currentRank.total_xp}</p>
                </div>
                <p className="text-sm text-gray-500">XP</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Players - {getPeriodLabel()}
          </h2>
        </div>
        <div className="p-6">
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.student_id === user?.id
                return (
                  <div
                    key={entry.student_id}
                    className={`flex items-center justify-between p-4 rounded-lg transition ${
                      isCurrentUser
                        ? 'border-2'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    style={isCurrentUser ? {
                      backgroundColor: ROLE_COLORS.student.light,
                      borderColor: ROLE_COLORS.student.primary
                    } : {}}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                        <span className="text-white font-bold">#{entry.rank}</span>
                      </div>
                      {getRankIcon(entry.rank)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm font-normal" style={{ color: ROLE_COLORS.student.primary }}>
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{entry.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 text-orange-500" />
                        <p className="font-bold text-lg text-gray-900">{entry.total_xp}</p>
                      </div>
                      <p className="text-xs text-gray-500">XP</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No leaderboard data yet</p>
              <p className="text-gray-400 text-sm">
                Complete quests and earn XP to appear on the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* XP Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">How to earn XP</p>
            <p className="text-sm text-blue-700">
              You earn 10 XP for each step you complete in a course. Complete more steps to climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
