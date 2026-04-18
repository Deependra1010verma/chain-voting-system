import { Request, Response } from 'express';
import Settings from '../models/Settings';
import Candidate from '../models/Candidate';
import User from '../models/User';
import ElectionHistory from '../models/ElectionHistory';

interface AuthRequest extends Request {
    user?: any;
}

const serializeCurrentElection = (
    settings: any,
    candidates: any[],
    hasVoted: boolean
) => ({
    _id: settings._id,
    electionName: settings.electionName,
    electionId: settings.currentElectionId,
    startDate: settings.startDate,
    endDate: settings.endDate,
    isActive: settings.isActive,
    resultDeclared: settings.resultDeclared,
    declaredAt: settings.declaredAt,
    candidates: candidates.map((candidate) => ({
        _id: candidate._id,
        name: candidate.name,
        party: candidate.party,
        position: candidate.position,
        image: candidate.image,
        voteCount: candidate.voteCount,
    })),
    hasVoted,
});

const serializeHistoricElection = (past: any, hasVoted: boolean) => ({
    _id: past._id,
    electionName: past.electionName,
    electionId: past.electionId,
    isActive: false,
    resultDeclared: true,
    declaredAt: past.declaredAt,
    winner: past.winner,
    candidates: past.results || [],
    hasVoted,
});

// GET /api/elections
// Returns both active (ongoing) elections AND past result-declared elections.
// Active elections come first, then result-declared sorted by most recent.
export const getAllElections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const user = userId ? await User.findById(userId) : null;
        const votedSet = new Set(user?.votedElections || []);

        // 1. Get the current settings (active or recently closed)
        const currentSettings = await Settings.findOne();
        const candidates = await Candidate.find({}, 'name party position image voteCount');

        const activeElections: any[] = [];
        const declaredElections: any[] = [];

        // If there's a current active election, include it
        if (currentSettings && currentSettings.isActive) {
            activeElections.push(
                serializeCurrentElection(
                    currentSettings,
                    candidates,
                    votedSet.has(currentSettings.currentElectionId)
                )
            );
        }

        // If current election has result declared but not yet archived to history,
        // include it in the declared section
        if (currentSettings && !currentSettings.isActive && currentSettings.resultDeclared) {
            declaredElections.push(
                serializeCurrentElection(
                    currentSettings,
                    candidates,
                    votedSet.has(currentSettings.currentElectionId)
                )
            );
        }

        // 2. Get all past elections from ElectionHistory (sorted newest first)
        const pastElections = await ElectionHistory.find().sort({ declaredAt: -1 });
        for (const past of pastElections) {
            // Skip if already included above (current result-declared election)
            if (currentSettings && past.electionId === currentSettings.currentElectionId) {
                continue;
            }
            declaredElections.push(serializeHistoricElection(past, votedSet.has(past.electionId)));
        }

        // Active first, then declared (newest first)
        res.json([...activeElections, ...declaredElections]);
    } catch (error) {
        console.error('Error in getAllElections:', error);
        res.status(500).json({ message: 'Server Error fetching elections' });
    }
};

// GET /api/elections/:electionId
// Returns a single election with per-user voting status.
export const getElectionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { electionId } = req.params;
        const userId = req.user?.id;
        const user = userId ? await User.findById(userId) : null;
        const votedSet = new Set(user?.votedElections || []);

        const currentSettings = await Settings.findOne();
        if (currentSettings && currentSettings.currentElectionId === electionId) {
            const candidates = await Candidate.find({}, 'name party position image voteCount');
            res.json(
                serializeCurrentElection(
                    currentSettings,
                    candidates,
                    votedSet.has(currentSettings.currentElectionId)
                )
            );
            return;
        }

        const historicElection = await ElectionHistory.findOne({ electionId });
        if (!historicElection) {
            res.status(404).json({ message: 'Election not found' });
            return;
        }

        res.json(serializeHistoricElection(historicElection, votedSet.has(historicElection.electionId)));
    } catch (error) {
        console.error('Error in getElectionById:', error);
        res.status(500).json({ message: 'Server Error fetching election' });
    }
};
