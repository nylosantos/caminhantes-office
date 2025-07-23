import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Download, Loader, Check, Calendar, ImageIcon, Palette, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';
import PositionController from './PositionController';
import { BaseGeneratorData } from '@/types/generator';
import { Match, MatchFormData } from '@/types/matches';
import { RoundTranslationsDocument } from '@/types/translations';
import GameArtSelector from './GameArtSelector';
import { convertToSaoPauloTime, formatCompetitionRound, formatDateToBrazilian } from '@/utils/dateUtils';
import PostTextGenerator from './PostTextGenerator';
import { EscalacaoData } from './EscalacaoGenerator';
import LayerManager from '../generator/LayerManager';

interface FullTimeGeneratorProps {
    onBack: () => void;
    translations: RoundTranslationsDocument[];
}

interface ElementConfig {
    canvasWidth: number;
    canvasHeight: number;
    logoX: number;
    logoY: number;
    logoSize: number;
    finalScoreImgX: number;
    finalScoreImgY: number;
    finalScoreImgWidth: number;
    finalScoreImgHeight: number;
    stadiumTextX: number;
    stadiumTextY: number;
    userBackgroundImgX: number;
    userBackgroundImgY: number;
    userBackgroundImgWidth: number;
    userBackgroundImgHeight: number;
}

const initialImageGeneratorConfigs: Record<'quadrada' | 'vertical' | 'horizontal', ElementConfig> = {
    quadrada: {
        canvasWidth: 1080, canvasHeight: 1080, logoX: 931, logoY: 61, logoSize: 123,
        finalScoreImgX: 0, finalScoreImgY: 500, finalScoreImgWidth: 1080, finalScoreImgHeight: 607.5,
        stadiumTextX: 1080 / 2, stadiumTextY: 40, userBackgroundImgX: 0, userBackgroundImgY: 0,
        userBackgroundImgWidth: 1080, userBackgroundImgHeight: 1080,
    },
    vertical: {
        canvasWidth: 1080, canvasHeight: 1920, logoX: 865, logoY: 203, logoSize: 175,
        finalScoreImgX: 0, finalScoreImgY: 1008, finalScoreImgWidth: 1080, finalScoreImgHeight: 607.5,
        stadiumTextX: 1080 / 2, stadiumTextY: 185, userBackgroundImgX: 0, userBackgroundImgY: 0,
        userBackgroundImgWidth: 1080, userBackgroundImgHeight: 1920,
    },
    horizontal: {
        canvasWidth: 1920, canvasHeight: 1080, logoX: 1761, logoY: 31, logoSize: 123,
        finalScoreImgX: 850, finalScoreImgY: -40, finalScoreImgWidth: 450, finalScoreImgHeight: 253,
        stadiumTextX: 1920 / 2, stadiumTextY: 40, userBackgroundImgX: 0, userBackgroundImgY: 0,
        userBackgroundImgWidth: 1920, userBackgroundImgHeight: 1080,
    }
};

const FullTimeGenerator: React.FC<FullTimeGeneratorProps> = ({ onBack, translations }) => {
    const { baseImages } = useImages();
    const [configs, setConfigs] = useState(initialImageGeneratorConfigs);

    const canvasFundoRef = useRef<HTMLCanvasElement>(null);
    const canvasInteracaoRef = useRef<HTMLCanvasElement>(null);
    const canvasFrenteRef = useRef<HTMLCanvasElement>(null);

    const [renderOrder, setRenderOrder] = useState(['background', 'acabamento', 'placar', 'logo', 'info']);
    const [activeElementKey, setActiveElementKey] = useState<string | null>(null);
    const [activeImageType, setActiveImageType] = useState<'quadrada' | 'vertical' | 'horizontal'>('quadrada');
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const matchSelectorRef = useRef<MatchSelectorRef>(null);
    const colors = { primary: '#ffffff', secondary: '#1ae9de' };
    const [currentStep, setCurrentStep] = useState(1);
    const [generating, setGenerating] = useState(false);
    const [downloadable, setDownloadable] = useState(false);
    const [generatorData, setGeneratorData] = useState<BaseGeneratorData & { userBackgroundImg: string | null, userBackgroundImgAspectRatio: number | null }>({
        matchData: null, gameArt: null, featuredPlayer: null, featuredPlayerImageUrl: null,
        featuredPlayerImgIndex: null, userBackgroundImg: null, userBackgroundImgAspectRatio: null,
    });

    const steps = [
        { id: 1, title: 'Dados da Partida', icon: Calendar, description: 'Selecione a partida' },
        { id: 2, title: 'Placar Final', icon: Palette, description: 'Upload da imagem do placar' },
        { id: 3, title: 'Fundo', icon: Upload, description: 'Upload da imagem de fundo' },
        { id: 4, title: 'Gerar Imagem', icon: ImageIcon, description: 'Ajuste e gere a imagem' }
    ];
    const [step1Valid, setStep1Valid] = useState(false);

    const canAdvanceToStep = (step: number): boolean => {
        switch (step) {
            case 2: return step1Valid;
            case 3: return !!generatorData.gameArt;
            case 4: return !!generatorData.userBackgroundImg;
            default: return true;
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1 && matchSelectorRef.current && !matchSelectorRef.current.canProceed) {
            if (!matchSelectorRef.current.submitManualData()) return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleMatchSelect = (matchData: Match) => {
        const matchDate = new Date(matchData.fixture.date);
        const saoPauloDate = convertToSaoPauloTime(matchDate);
        const formData: MatchFormData = {
            homeTeam: 'Liverpool', awayTeam: 'Adversário', competition: formatCompetitionRound(matchData, translations),
            matchDate: new Date().toISOString().split('T')[0], matchTime: '16:00',
            venue: matchData.fixture.venue.name || 'Estádio não informado', matchday: '', stage: '',
            referee: matchData.fixture.referee || '', stadium: matchData.fixture.venue.name || 'Estádio não informado',
            date: formatDateToBrazilian(saoPauloDate), competitionRound: formatCompetitionRound(matchData, translations),
        };
        setSelectedMatch(matchData);
        setGeneratorData(prev => ({ ...prev, matchData: formData }));
    };

    const handleScoreImageSelect = (scoreImageUrl: string) => {
        setGeneratorData(prev => ({ ...prev, gameArt: scoreImageUrl }));
    };

    const handleUserBackgroundImgSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                setGeneratorData(prev => ({
                    ...prev,
                    userBackgroundImg: reader.result as string,
                    userBackgroundImgAspectRatio: img.width / img.height,
                }));
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (!generatorData.userBackgroundImg || !generatorData.userBackgroundImgAspectRatio) return;

        const aspectRatio = generatorData.userBackgroundImgAspectRatio;
        const currentCanvasConfig = configs[activeImageType];

        let newHeight: number;
        if (activeImageType === 'vertical') {
            newHeight = 1550;
        } else {
            newHeight = currentCanvasConfig.canvasHeight;
        }

        const newWidth = newHeight * aspectRatio;
        const newX = (currentCanvasConfig.canvasWidth - newWidth) / 2;
        const newY = (currentCanvasConfig.canvasHeight - newHeight) / 2;

        setConfigs(prev => ({
            ...prev,
            [activeImageType]: {
                ...prev[activeImageType],
                userBackgroundImgWidth: newWidth,
                userBackgroundImgHeight: newHeight,
                userBackgroundImgX: newX,
                userBackgroundImgY: newY,
            }
        }));
    }, [generatorData.userBackgroundImg, generatorData.userBackgroundImgAspectRatio, activeImageType]);


    const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
            img.src = src;
        });
    }, []);

    const drawLayer = useCallback(async (
        canvasRef: React.RefObject<HTMLCanvasElement>,
        config: ElementConfig,
        elementsToDraw: string[]
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = config.canvasWidth;
        canvas.height = config.canvasHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const key of elementsToDraw) {
            if (key === 'background' && generatorData.userBackgroundImg) {
                try {
                    const userBgImg = await loadImage(generatorData.userBackgroundImg);
                    ctx.drawImage(userBgImg, config.userBackgroundImgX, config.userBackgroundImgY, config.userBackgroundImgWidth, config.userBackgroundImgHeight);
                } catch (e) { console.error(e); }
            } else if (key === 'acabamento') {
                try {
                    const imgUrl = baseImages.find(img => img.type === activeImageType && img.section === 'fim_de_jogo')?.url;
                    if (imgUrl) {
                        const overlayImg = await loadImage(imgUrl);
                        ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
                    }
                } catch (e) { console.warn(e); }
            } else if (key === 'placar' && generatorData.gameArt) {
                try {
                    const placarImg = await loadImage(generatorData.gameArt);
                    ctx.drawImage(placarImg, config.finalScoreImgX, config.finalScoreImgY, config.finalScoreImgWidth, config.finalScoreImgHeight);
                } catch (e) { console.error(e); }
            } else if (key === 'logo') {
                try {
                    const logoImg = await loadImage('/src/assets/caminhantes-clock.png');
                    ctx.drawImage(logoImg, config.logoX, config.logoY, config.logoSize, config.logoSize);
                } catch (e) { console.error(e); }
            } else if (key === 'info' && generatorData.matchData) {
                ctx.fillStyle = colors.primary;
                ctx.font = '800 24px "Funnel Display", Arial, sans-serif';
                ctx.textAlign = 'center';
                const text = `${generatorData.matchData.stadium.toUpperCase()} - ${generatorData.matchData.competitionRound.toUpperCase()}`;
                ctx.fillText(text, config.stadiumTextX, config.stadiumTextY);
            }
        }
    }, [generatorData, baseImages, colors.primary, activeImageType, loadImage]);

    const redrawAllLayers = useCallback(() => {
        if (currentStep !== 4 || !canvasFundoRef.current || !canvasInteracaoRef.current || !canvasFrenteRef.current) return;

        setGenerating(true);
        const config = configs[activeImageType];
        const activeIndex = activeElementKey ? renderOrder.indexOf(activeElementKey) : -1;

        const behindElements = activeIndex > -1 ? renderOrder.slice(0, activeIndex) : renderOrder;
        const activeElement = activeIndex > -1 ? [renderOrder[activeIndex]] : [];
        const aheadElements = activeIndex > -1 ? renderOrder.slice(activeIndex + 1) : [];

        Promise.all([
            // @ts-expect-error
            drawLayer(canvasFundoRef, config, behindElements),
            // @ts-expect-error
            drawLayer(canvasInteracaoRef, config, activeElement),
            // @ts-expect-error
            drawLayer(canvasFrenteRef, config, aheadElements)
        ]).then(() => {
            setGenerating(false);
            setDownloadable(true);
        }).catch(error => {
            console.error("Erro ao desenhar camadas:", error);
            setGenerating(false);
        });
    }, [currentStep, configs, activeImageType, activeElementKey, renderOrder, drawLayer]);

    useEffect(() => {
        redrawAllLayers();
    }, [redrawAllLayers]);

    useEffect(() => {
        if (currentStep !== 4 || !activeElementKey || !canvasInteracaoRef?.current) return;
        const config = configs[activeImageType];
        const activeElement = [activeElementKey];
        // @ts-expect-error
        drawLayer(canvasInteracaoRef, config, activeElement);
    }, [configs, activeElementKey, activeImageType, currentStep, drawLayer]);

    const downloadImage = () => {
        const finalCanvas = document.createElement('canvas');
        const config = configs[activeImageType];
        finalCanvas.width = config.canvasWidth;
        finalCanvas.height = config.canvasHeight;
        const ctx = finalCanvas.getContext('2d');
        if (!ctx || !canvasFundoRef.current || !canvasInteracaoRef.current || !canvasFrenteRef.current) return;

        ctx.drawImage(canvasFundoRef.current, 0, 0);
        ctx.drawImage(canvasInteracaoRef.current, 0, 0);
        ctx.drawImage(canvasFrenteRef.current, 0, 0);

        const a = document.createElement('a');
        a.href = finalCanvas.toDataURL('image/png');
        a.download = `${activeImageType}_placar_final.png`;
        a.click();
    };

    // FUNÇÕES CORRIGIDAS
    const handleMoveElement = (axis: 'x' | 'y', amount: number) => {
        if (!activeElementKey) return;
        setConfigs(prev => {
            // CORREÇÃO: Constrói a chave corretamente para 'background'
            const keyX = activeElementKey === 'background' ? 'userBackgroundImgX' : `${activeElementKey}X` as keyof ElementConfig;
            const keyY = activeElementKey === 'background' ? 'userBackgroundImgY' : `${activeElementKey}Y` as keyof ElementConfig;

            const newConfig = { ...prev[activeImageType] };

            if (axis === 'x' && keyX in newConfig) {
                (newConfig[keyX] as number) += amount;
            } else if (axis === 'y' && keyY in newConfig) {
                (newConfig[keyY] as number) += amount;
            }

            return { ...prev, [activeImageType]: newConfig };
        });
    };

    const handleResizeElement = (amount: number) => {
        if (!activeElementKey) return;
        setConfigs(prev => {
            // CORREÇÃO: Constrói as chaves corretamente para 'background'
            const sizeKey = `${activeElementKey}Size` as keyof ElementConfig;
            const widthKey = activeElementKey === 'background' ? 'userBackgroundImgWidth' : `${activeElementKey}Width` as keyof ElementConfig;
            const heightKey = activeElementKey === 'background' ? 'userBackgroundImgHeight' : `${activeElementKey}Height` as keyof ElementConfig;

            const newConfig = { ...prev[activeImageType] };

            if (sizeKey in newConfig && typeof newConfig[sizeKey] === 'number') {
                (newConfig[sizeKey] as number) += amount;
            } else if (widthKey in newConfig && typeof newConfig[widthKey] === 'number') {
                const aspectRatio = (newConfig[heightKey] as number) / (newConfig[widthKey] as number) || 1;
                (newConfig[widthKey] as number) += amount;
                (newConfig[heightKey] as number) = (newConfig[widthKey] as number) * aspectRatio;
            }

            return { ...prev, [activeImageType]: newConfig };
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Button onClick={onBack} variant="ghost" size="sm" className="mr-4"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
                        <h1 className="text-xl font-display-bold text-gray-800">Gerador de Imagem de Placar Final</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between mb-8">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep === step.id ? 'bg-red-600 border-red-600 text-white cursor-pointer' : currentStep > step.id ? 'bg-green-600 border-green-600 text-white cursor-pointer' : canAdvanceToStep(step.id) ? 'border-gray-300 text-gray-500 hover:border-red-300 cursor-pointer' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`} onClick={() => canAdvanceToStep(step.id) && setCurrentStep(step.id)}>
                                {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <div className="ml-3 hidden md:block">
                                <p className={`text-sm font-display-medium ${currentStep === step.id ? 'text-red-600' : currentStep > step.id ? 'text-green-600' : 'text-gray-500'}`}>{step.title}</p>
                                <p className="text-xs text-gray-500 font-display">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && <div className={`w-12 h-px mx-4 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {currentStep === 1 && <MatchSelector ref={matchSelectorRef} onMatchSelected={handleMatchSelect} escalacaoData={{ ...generatorData, formation: null, selectedPlayers: {}, reservePlayers: [], coach: '' }} onValidationChange={setStep1Valid} translations={translations} pastMatches />}
                    {currentStep === 2 && <GameArtSelector onArtSelect={handleScoreImageSelect} escalacaoData={{ ...generatorData, formation: null, selectedPlayers: {}, reservePlayers: [], coach: '' }} setEscalacaoData={(update) => setGeneratorData(prev => { let newState; if (typeof update === 'function') { const prevAsEscalacaoData: EscalacaoData = { ...prev, formation: null, selectedPlayers: {}, reservePlayers: [], coach: '' }; newState = update(prevAsEscalacaoData); } else { newState = update; } return { ...prev, gameArt: newState.gameArt !== undefined ? newState.gameArt : prev.gameArt }; })} offPlayer />}
                    {currentStep === 3 && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <label htmlFor="background-image-upload" className="cursor-pointer text-center">
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600">Clique para selecionar a imagem de fundo</p>
                                <input id="background-image-upload" type="file" accept="image/*" className="hidden" onChange={handleUserBackgroundImgSelect} />
                            </label>
                            {generatorData.userBackgroundImg && <img src={generatorData.userBackgroundImg} alt="Preview" className="mt-4 max-h-48 w-auto rounded-lg" />}
                        </div>
                    )}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-display-medium text-gray-700 mb-2">Editar Imagem:</label>
                                        <select value={activeImageType} onChange={(e) => setActiveImageType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                            <option value="quadrada">Quadrada</option>
                                            <option value="vertical">Vertical</option>
                                            {/* <option value="horizontal">Horizontal</option> */}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-display-medium text-gray-700 mb-2">Elemento a ser Movido:</label>
                                        <select value={activeElementKey ?? ''} onChange={(e) => setActiveElementKey(e.target.value || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                            <option value="">Nenhum</option>
                                            {renderOrder.map(key => <option key={key} value={key} className="capitalize">{key}</option>)}
                                        </select>
                                    </div>
                                    {activeElementKey && <PositionController elementName={activeElementKey} onMove={handleMoveElement} onResize={handleResizeElement} />}
                                    <div className="mt-4 pt-4 border-t"><LayerManager renderOrder={renderOrder} setRenderOrder={setRenderOrder} /></div>
                                </div>
                                <div className="relative md:col-span-2 w-full flex justify-center items-center bg-gray-200 rounded-lg p-2">
                                    <div style={{ position: 'relative', width: '100%', paddingBottom: `${(configs[activeImageType].canvasHeight / configs[activeImageType].canvasWidth) * 100}%` }}>
                                        {[canvasFundoRef, canvasInteracaoRef, canvasFrenteRef].map((ref, index) => (
                                            <canvas key={index} ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: index + 1 }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {selectedMatch && <PostTextGenerator postType={'fimDeJogo'} match={selectedMatch} translations={translations} />}
                            <div className="flex justify-center space-x-4">
                                <Button onClick={redrawAllLayers} disabled={generating} className="bg-red-600 hover:bg-red-700 text-white">
                                    {generating ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Gerando...</> : <><ImageIcon className="w-4 h-4 mr-2" /> Gerar Imagem</>}
                                </Button>
                                {downloadable && <Button onClick={downloadImage} disabled={generating} variant="outline"><Download className="w-4 h-4 mr-2" /> Download</Button>}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`flex ${currentStep === 1 ? 'justify-end' : 'justify-between'} mt-6`}>
                    {currentStep > 1 && <Button onClick={() => setCurrentStep(prev => prev - 1)} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Anterior</Button>}
                    {currentStep < 4 && <Button onClick={handleNextStep} disabled={!canAdvanceToStep(currentStep + 1)} className="bg-red-600 hover:bg-red-700 text-white">Próximo <ArrowRight className="w-4 h-4 ml-2" /></Button>}
                </div>
            </div>
        </div>
    );
};

export default FullTimeGenerator;
