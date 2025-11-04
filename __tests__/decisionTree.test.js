import decisionTree from '../data/decision-tree.json';

describe('Decision Tree Data Structure', () => {
  describe('Metadata', () => {
    it('should have valid metadata', () => {
      expect(decisionTree.metadata).toBeDefined();
      expect(decisionTree.metadata.version).toBe('1.0');
      expect(decisionTree.metadata.process).toBe('MIG (GMAW)');
      expect(decisionTree.metadata.shielding_gas).toBe('C25 (75% Argon, 25% CO2)');
    });
  });

  describe('Start Node', () => {
    it('should have a valid start node', () => {
      expect(decisionTree.startNode).toBeDefined();
      expect(typeof decisionTree.startNode).toBe('string');
      expect(decisionTree.nodes[decisionTree.startNode]).toBeDefined();
    });

    it('start node should be an image-question type', () => {
      const startNode = decisionTree.nodes[decisionTree.startNode];
      expect(startNode.type).toBe('image-question');
      expect(startNode.question).toBeDefined();
      expect(startNode.choices).toBeDefined();
      expect(Array.isArray(startNode.choices)).toBe(true);
    });
  });

  describe('Node Structure Validation', () => {
    it('all nodes should have valid types', () => {
      const validTypes = ['image-question', 'text-question', 'diagnosis'];
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        expect(validTypes).toContain(node.type);
      });
    });

    it('all question nodes should have required fields', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'image-question' || node.type === 'text-question') {
          expect(node.question).toBeDefined();
          expect(typeof node.question).toBe('string');
          expect(node.choices).toBeDefined();
          expect(Array.isArray(node.choices)).toBe(true);
          expect(node.choices.length).toBeGreaterThan(0);
        }
      });
    });

    it('all diagnosis nodes should have required fields', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'diagnosis') {
          expect(node.diagnosis).toBeDefined();
          expect(typeof node.diagnosis).toBe('string');
          expect(node.description).toBeDefined();
          expect(typeof node.description).toBe('string');
          expect(node.recommendations).toBeDefined();
          expect(Array.isArray(node.recommendations)).toBe(true);
        }
      });
    });
  });

  describe('Choice Validation', () => {
    it('all image-question choices should have required fields', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'image-question') {
          node.choices.forEach((choice) => {
            expect(choice.id).toBeDefined();
            expect(choice.text).toBeDefined();
            expect(choice.image).toBeDefined();
            expect(choice.description).toBeDefined();
            expect(choice.nextNode).toBeDefined();
          });
        }
      });
    });

    it('all text-question choices should have required fields', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'text-question') {
          node.choices.forEach((choice) => {
            expect(choice.id).toBeDefined();
            expect(choice.text).toBeDefined();
            expect(choice.nextNode).toBeDefined();
          });
        }
      });
    });

    it('all nextNode references should point to valid nodes', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'image-question' || node.type === 'text-question') {
          node.choices.forEach((choice) => {
            expect(decisionTree.nodes[choice.nextNode]).toBeDefined();
          });
        }
      });
    });
  });

  describe('Recommendation Validation', () => {
    it('all recommendations should have required fields', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'diagnosis') {
          node.recommendations.forEach((rec) => {
            expect(rec.parameter).toBeDefined();
            expect(typeof rec.parameter).toBe('string');
            expect(rec.adjustment).toBeDefined();
            expect(typeof rec.adjustment).toBe('string');
            expect(rec.details).toBeDefined();
            expect(typeof rec.details).toBe('string');
          });
        }
      });
    });
  });

  describe('Navigation Paths', () => {
    it('should not have circular references at the first level', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'image-question' || node.type === 'text-question') {
          node.choices.forEach((choice) => {
            // No choice should point back to the same node
            expect(choice.nextNode).not.toBe(nodeId);
          });
        }
      });
    });

    it('should reach at least one diagnosis from start', () => {
      const startNode = decisionTree.nodes[decisionTree.startNode];
      let reachedDiagnosis = false;

      const checkPath = (nodeId, visited = new Set()) => {
        if (visited.has(nodeId)) return false;
        visited.add(nodeId);

        const node = decisionTree.nodes[nodeId];
        if (node.type === 'diagnosis') {
          return true;
        }

        if (node.choices) {
          for (const choice of node.choices) {
            if (checkPath(choice.nextNode, new Set(visited))) {
              return true;
            }
          }
        }
        return false;
      };

      startNode.choices.forEach((choice) => {
        if (checkPath(choice.nextNode)) {
          reachedDiagnosis = true;
        }
      });

      expect(reachedDiagnosis).toBe(true);
    });
  });

  describe('Content Quality', () => {
    it('all questions should end with a question mark or be a statement', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'image-question' || node.type === 'text-question') {
          expect(node.question.length).toBeGreaterThan(10);
        }
      });
    });

    it('all diagnosis titles should not be empty', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'diagnosis') {
          expect(node.diagnosis.length).toBeGreaterThan(0);
          expect(node.description.length).toBeGreaterThan(20);
        }
      });
    });

    it('should have multiple diagnosis outcomes', () => {
      const diagnosisNodes = Object.keys(decisionTree.nodes).filter(
        (nodeId) => decisionTree.nodes[nodeId].type === 'diagnosis'
      );
      expect(diagnosisNodes.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Image References', () => {
    it('all image paths should follow the expected pattern', () => {
      Object.keys(decisionTree.nodes).forEach((nodeId) => {
        const node = decisionTree.nodes[nodeId];
        if (node.type === 'image-question') {
          node.choices.forEach((choice) => {
            expect(choice.image).toMatch(/^resources\/images\/.*\.jpg$/);
          });
        }
      });
    });

    it('should have no duplicate image references in the start node', () => {
      const startNode = decisionTree.nodes[decisionTree.startNode];
      const images = startNode.choices.map((c) => c.image);
      const uniqueImages = new Set(images);
      expect(images.length).toBe(uniqueImages.size);
    });
  });
});
