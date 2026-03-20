import { useState } from 'react'
import { triageApi } from '../../api/triage'
import { exportarReporteExcel } from '../../utils/exportarExcel'
import { exportarTriagePDF } from '../../utils/exportarPDF'
import type { TriageResponse } from '../../types'
import { Pagination } from '../../components/ui/Pagination'
import { ModalSeguimiento } from '../../components/ui/ModalSeguimiento'
import { toLocalISOString, hoyLocal } from '../../utils/fechas'

const NIVEL_CONFIG: Record<number, { label: string; color: string; dot: string }> = {
  1: { label: 'Emergencia', color: 'text-red-400', dot: 'bg-red-500' },
  2: { label: 'Urgente', color: 'text-orange-400', dot: 'bg-orange-500' },
  3: { label: 'Semi-urgente', color: 'text-blue-400', dot: 'bg-blue-500' },
  4: { label: 'No urgente', color: 'text-green-400', dot: 'bg-green-500' },
}

type ReporteStats = {
  total: number
  emergencias: number
  urgentes: number
  semiUrgentes: number
  noUrgentes: number
}

const EMPTY_STATS: ReporteStats = {
  total: 0,
  emergencias: 0,
  urgentes: 0,
  semiUrgentes: 0,
  noUrgentes: 0,
}

const PAGE_SIZE = 10

export function AdminReportes() {
  const hoy = hoyLocal()

  const [desde, setDesde] = useState(hoy)
  const [hasta, setHasta] = useState(hoy)
  const [triages, setTriages] = useState<TriageResponse[]>([])
  const [stats, setStats] = useState<ReporteStats>(EMPTY_STATS)

  const [loading, setLoading] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [buscado, setBuscado] = useState(false)
  const [error, setError] = useState('')
  const [vistaTabla, setVistaTabla] = useState(true)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [triageSeguimiento, setTriageSeguimiento] = useState<TriageResponse | null>(null)

  const limpiarResultados = () => {
    setTriages([])
    setStats(EMPTY_STATS)
    setPage(1)
    setTotalPages(1)
    setTotalItems(0)
  }

  const validarFechas = () => {
    if (!desde || !hasta) {
      setError('Debes seleccionar ambas fechas.')
      limpiarResultados()
      setBuscado(true)
      return false
    }

    if (desde > hasta) {
      setError('La fecha "Desde" no puede ser mayor que la fecha "Hasta".')
      limpiarResultados()
      setBuscado(true)
      return false
    }

    return true
  }

  const cargarReporte = async (p = 1) => {
    setError('')

    if (!validarFechas()) return

    setLoading(true)

    try {
      const fechaDesde = toLocalISOString(desde, false)
      const fechaHasta = toLocalISOString(hasta, true)

      const [res, statsData] = await Promise.all([
        triageApi.getReportePaginado(fechaDesde, fechaHasta, p, PAGE_SIZE),
        triageApi.getStatsRango(fechaDesde, fechaHasta),
      ])

      setTriages(res.data ?? [])
      setPage(res.page ?? p)
      setTotalPages(res.totalPages ?? 1)
      setTotalItems(res.totalItems ?? 0)
      setStats({
        total: statsData?.total ?? 0,
        emergencias: statsData?.emergencias ?? 0,
        urgentes: statsData?.urgentes ?? 0,
        semiUrgentes: statsData?.semiUrgentes ?? 0,
        noUrgentes: statsData?.noUrgentes ?? 0,
      })
      setBuscado(true)
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'No se pudo obtener el reporte.')
      limpiarResultados()
      setBuscado(true)
    } finally {
      setLoading(false)
    }
  }

  const buscar = async () => {
    setBuscado(false)
    await cargarReporte(1)
  }

  const onPageChange = async (p: number) => {
    await cargarReporte(p)
  }

  const handleExportarExcel = async () => {
    setError('')

    if (!validarFechas()) return

    try {
      setExportando(true)

      const fechaDesde = toLocalISOString(desde, false)
      const fechaHasta = toLocalISOString(hasta, true)

      const primeraPagina = await triageApi.getReportePaginado(fechaDesde, fechaHasta, 1, PAGE_SIZE)

      let todosLosTriages: TriageResponse[] = [...(primeraPagina.data ?? [])]
      const paginasTotales = primeraPagina.totalPages ?? 1

      if (paginasTotales > 1) {
        const promesas: Promise<any>[] = []

        for (let p = 2; p <= paginasTotales; p++) {
          promesas.push(triageApi.getReportePaginado(fechaDesde, fechaHasta, p, PAGE_SIZE))
        }

        const respuestas = await Promise.all(promesas)
        respuestas.forEach(r => {
          if (Array.isArray(r.data)) {
            todosLosTriages = todosLosTriages.concat(r.data)
          }
        })
      }

      exportarReporteExcel(todosLosTriages, desde, hasta)
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? 'No se pudo exportar el reporte.')
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">Reportes</h2>
        <p className="text-gray-400 mt-1 text-sm">Exporta triages por rango de fechas</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={buscar}
            disabled={loading}
            type="button"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>

          {buscado && triages.length > 0 && (
            <button
              onClick={handleExportarExcel}
              disabled={exportando}
              type="button"
              className="flex items-center gap-2 px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exportando ? 'Exportando...' : 'Exportar Excel'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {buscado && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Emergencias', value: stats.emergencias, color: 'text-red-400' },
              { label: 'Urgentes', value: stats.urgentes, color: 'text-orange-400' },
              { label: 'Semi-urgentes', value: stats.semiUrgentes, color: 'text-blue-400' },
              { label: 'No urgentes', value: stats.noUrgentes, color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {triages.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">{totalItems} registros encontrados</p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVistaTabla(true)}
                  type="button"
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    vistaTabla ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Tabla
                </button>

                <button
                  onClick={() => setVistaTabla(false)}
                  type="button"
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    !vistaTabla ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Detallado
                </button>
              </div>
            </div>
          )}

          {triages.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-sm">No hay triages en el rango seleccionado</p>
            </div>
          ) : vistaTabla ? (
            <>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Paciente</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Nivel</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Diagnóstico principal</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Signos vitales</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Registrado por</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {triages.map(t => {
                      const nivel = NIVEL_CONFIG[t.nivel] ?? {
                        label: 'Sin clasificar',
                        color: 'text-gray-400',
                        dot: 'bg-gray-500',
                      }

                      return (
                        <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap">
                            {new Date(t.fechaRegistro).toLocaleString('es-PE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-white">{t.nombrePaciente}</p>
                            <p className="text-xs text-gray-400">
                              {t.numeroDocumento} · {t.edad} años
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${nivel.dot}`} />
                              <span className={`text-xs font-medium ${nivel.color}`}>{nivel.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{t.tiempoAtencion}</p>
                          </td>

                          <td className="px-4 py-3">
                            {t.diagnosticosDiferenciales?.[0] ? (
                              <>
                                <p className="text-xs text-white">{t.diagnosticosDiferenciales[0].nombre}</p>

                                <div className="flex items-center gap-1.5 mt-1">
                                  <div className="w-16 bg-gray-700 rounded-full h-1">
                                    <div
                                      className="bg-blue-500 h-1 rounded-full"
                                      style={{ width: `${t.diagnosticosDiferenciales[0].probabilidad}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-blue-400">
                                    {t.diagnosticosDiferenciales[0].probabilidad}%
                                  </span>
                                </div>

                                {t.diagnosticosDiferenciales.length > 1 && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    +{t.diagnosticosDiferenciales.length - 1} más
                                  </p>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-600 italic">Registro previo</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {t.temperatura != null && (
                                <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">
                                  {t.temperatura}°C
                                </span>
                              )}

                              {t.saturacionOxigeno != null && (
                                <span
                                  className={`px-1.5 py-0.5 text-xs rounded ${
                                    t.saturacionOxigeno < 94
                                      ? 'bg-red-500/10 text-red-400'
                                      : 'bg-gray-800 text-gray-300'
                                  }`}
                                >
                                  O₂ {t.saturacionOxigeno}%
                                </span>
                              )}

                              {t.frecuenciaCardiaca != null && (
                                <span
                                  className={`px-1.5 py-0.5 text-xs rounded ${
                                    t.frecuenciaCardiaca > 100 || t.frecuenciaCardiaca < 60
                                      ? 'bg-orange-500/10 text-orange-400'
                                      : 'bg-gray-800 text-gray-300'
                                  }`}
                                >
                                  {t.frecuenciaCardiaca} lpm
                                </span>
                              )}

                              {t.presionArterial && (
                                <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">
                                  {t.presionArterial}
                                </span>
                              )}

                              {t.temperatura == null &&
                                t.saturacionOxigeno == null &&
                                t.frecuenciaCardiaca == null &&
                                !t.presionArterial && <span className="text-xs text-gray-600">—</span>}
                            </div>

                            {t.alertasVitales?.length > 0 && (
                              <p className="text-xs text-red-400 mt-1">
                                ⚠ {t.alertasVitales.length} alerta{t.alertasVitales.length > 1 ? 's' : ''}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-400">{t.usuarioRegistra}</td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => exportarTriagePDF(t)}
                                type="button"
                                className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                              >
                                PDF
                              </button>

                              <button
                                onClick={() => setTriageSeguimiento(t)}
                                type="button"
                                className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs rounded-lg transition-colors"
                              >
                                Seguimiento
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  onPageChange={onPageChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                {triages.map(t => {
                  const sintomasNormales = (t.todosSintomas ?? []).filter(
                    s => !(t.signosAlarma ?? []).includes(s)
                  )

                  const nivel = NIVEL_CONFIG[t.nivel] ?? {
                    label: 'Sin clasificar',
                    color: 'text-gray-400',
                    dot: 'bg-gray-500',
                  }

                  return (
                    <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${nivel.dot}`} />
                          <div>
                            <p className="text-sm font-medium text-white">{t.nombrePaciente}</p>
                            <p className="text-xs text-gray-400">
                              {t.numeroDocumento} · {t.edad} años
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-xs font-medium ${nivel.color}`}>
                              Nivel {t.nivel} — {nivel.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(t.fechaRegistro).toLocaleString('es-PE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => exportarTriagePDF(t)}
                              type="button"
                              className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
                            >
                              PDF
                            </button>

                            <button
                              onClick={() => setTriageSeguimiento(t)}
                              type="button"
                              className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs rounded-lg transition-colors"
                            >
                              Seguimiento
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-3 border-b border-gray-800/50">
                        <p className="text-xs text-gray-400 mb-0.5">Recomendación clínica</p>
                        <p className="text-sm text-gray-200">{t.recomendacionClinica}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Tiempo de atención: {t.tiempoAtencion}
                        </p>
                      </div>

                      {(t.temperatura != null ||
                        t.frecuenciaCardiaca != null ||
                        t.saturacionOxigeno != null ||
                        t.presionArterial ||
                        t.frecuenciaRespiratoria != null ||
                        t.glucosa != null) && (
                        <div className="px-5 py-3 border-b border-gray-800/50">
                          <p className="text-xs text-gray-400 mb-2">Signos vitales</p>

                          <div className="flex flex-wrap gap-2">
                            {t.temperatura != null && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                                🌡 {t.temperatura}°C
                              </span>
                            )}

                            {t.frecuenciaCardiaca != null && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                                ❤ {t.frecuenciaCardiaca} lpm
                              </span>
                            )}

                            {t.saturacionOxigeno != null && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                                O₂ {t.saturacionOxigeno}%
                              </span>
                            )}

                            {t.presionArterial && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                                PA {t.presionArterial}
                              </span>
                            )}

                            {t.frecuenciaRespiratoria != null && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                                FR {t.frecuenciaRespiratoria} rpm
                              </span>
                            )}

                            {t.glucosa != null && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                                Glucosa {t.glucosa} mg/dL
                              </span>
                            )}
                          </div>

                          {t.alertasVitales?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {t.alertasVitales.map(a => (
                                <span
                                  key={a}
                                  className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md"
                                >
                                  ⚠ {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {t.diagnosticosDiferenciales?.length > 0 && (
                        <div className="px-5 py-3">
                          <p className="text-xs text-gray-400 mb-2">Diagnósticos diferenciales</p>

                          <div className="space-y-2">
                            {t.diagnosticosDiferenciales.map((d, i) => (
                              <div key={`${d.codigo}-${i}`} className="flex items-center gap-3">
                                <span className="text-xs text-gray-600 w-4">{i + 1}</span>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-sm text-white">{d.nombre}</p>
                                    <span className="text-xs font-semibold text-blue-400">
                                      {d.probabilidad}%
                                    </span>
                                  </div>

                                  <div className="w-full bg-gray-800 rounded-full h-1">
                                    <div
                                      className="bg-blue-500 h-1 rounded-full"
                                      style={{ width: `${d.probabilidad}%` }}
                                    />
                                  </div>

                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {d.grupo} · {d.recomendacion}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(t.todosSintomas?.length > 0 || t.observaciones) && (
                        <div className="px-5 py-3 border-t border-gray-800/50">
                          {t.todosSintomas?.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-400 mb-1.5">Síntomas</p>

                              <div className="flex flex-wrap gap-1.5">
                                {t.signosAlarma?.map(s => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-md border border-red-500/20"
                                  >
                                    {s}
                                  </span>
                                ))}

                                {sintomasNormales.map(s => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-md"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {t.observaciones && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Observaciones</p>
                              <p className="text-xs text-gray-300">{t.observaciones}</p>
                            </div>
                          )}

                          <p className="text-xs text-gray-600 mt-2">
                            Registrado por: {t.usuarioRegistra}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  onPageChange={onPageChange}
                />
              </div>
            </>
          )}
        </>
      )}

      {triageSeguimiento && (
        <ModalSeguimiento
          triage={triageSeguimiento}
          onClose={() => setTriageSeguimiento(null)}
          onRegistrado={() => setTriageSeguimiento(null)}
        />
      )}
    </div>
  )
}