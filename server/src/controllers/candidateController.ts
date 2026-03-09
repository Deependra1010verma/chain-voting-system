import { Request, Response } from 'express';
import Candidate from '../models/Candidate';

export const addCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, party, position, image } = req.body;

        const candidate = await Candidate.create({
            name,
            party,
            position,
            image
        });

        res.status(201).json(candidate);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
    }
};

export const getCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
        const candidates = await Candidate.find({});
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (candidate) {
            res.json(candidate);
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, party, position, image } = req.body;

        const candidate = await Candidate.findById(req.params.id);

        if (candidate) {
            candidate.name = name || candidate.name;
            candidate.party = party || candidate.party;
            candidate.position = position || candidate.position;
            candidate.image = image || candidate.image;

            const updatedCandidate = await candidate.save();
            res.json(updatedCandidate);
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (candidate) {
            await candidate.deleteOne();
            res.json({ message: 'Candidate removed' });
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
    }
};
